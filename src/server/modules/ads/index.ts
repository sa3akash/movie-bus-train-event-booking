import { Elysia, t } from "elysia";
import { db } from "../../db";
import { ads } from "../../db/schemas/ads";
import { eq, and, sql, gt, or, inArray } from "drizzle-orm";
import { authMiddleware, isAdmin } from "../../middlewares/auth";
import { videos } from "../../db/schemas/video";
import { adTracking } from "../../db/schemas/ads";

// Safely add 'ANY' to the ad_category enum
db.execute(sql`ALTER TYPE ad_category ADD VALUE IF NOT EXISTS 'ANY'`).catch(() => {});


// Helper function to generate tracking URLs for all events
const generateTracking = (adId: string) => {
  const events = [
    "impression", "clickTracking", "start", "firstQuartile", "midpoint", 
    "thirdQuartile", "complete", "skip", "error", "resume", "pause", 
    "mute", "unmute"
  ];
  
  const trackingObj: Record<string, string[]> = {};
  events.forEach((event) => {
    trackingObj[event] = [`/api/ads/track?event=${event}&adId=${adId}`];
  });
  
  return trackingObj;
};

export const adsModule = new Elysia({ prefix: "/ads" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ request, query, user }) => {
      const { videoId, deviceId } = query;

      // Extract context for targeting
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent);
      const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent);
      const userDevice = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";
      const userCountry = request.headers.get("cf-ipcountry") || "US"; // Cloudflare header or default

      // Frequency Capping Logic
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      let impressionCount = 0;

      if (user) {
        const result = await db.select({ count: sql`count(*)` }).from(adTracking).where(
          and(
            eq(adTracking.userId, user.id),
            eq(adTracking.event, 'impression'),
            gt(adTracking.createdAt, oneHourAgo)
          )
        );
        impressionCount = Number(result[0].count);
      } else if (deviceId) {
        const result = await db.select({ count: sql`count(*)` }).from(adTracking).where(
          and(
            eq(adTracking.deviceId, deviceId as string),
            eq(adTracking.event, 'impression'),
            gt(adTracking.createdAt, oneHourAgo)
          )
        );
        impressionCount = Number(result[0].count);
      }

      if (impressionCount >= 3) {
        console.log(`[ADS] Frequency cap hit for ${user ? 'user ' + user.id : 'device ' + deviceId}`);
        return { success: true, ads: [] };
      }

      // Fetch active ads randomly, ensuring budget is not exceeded
      const budgetCondition = sql`${ads.budget} IS NULL OR ${ads.spent} < ${ads.budget}`;

      const fetchAdsByCategory = async (categoryFilter: any) => {
        return db.query.ads.findMany({
          where: and(eq(ads.isActive, true), categoryFilter, budgetCondition),
          orderBy: sql`RANDOM()`,
          limit: 30, // Increased limit for larger pools
        });
      };

      const activePreRollAdsRaw = await fetchAdsByCategory(inArray(ads.category, ["PRE_ROLL", "ANY"]));
      const activeMidRollAdsRaw = await fetchAdsByCategory(inArray(ads.category, ["MID_ROLL", "ANY"]));
      const activePostRollAdsRaw = await fetchAdsByCategory(inArray(ads.category, ["POST_ROLL", "ANY"]));

      // Filter ads based on context
      const filterAd = (ad: any) => {
        if (ad.targetCountries && Array.isArray(ad.targetCountries) && ad.targetCountries.length > 0) {
          if (!ad.targetCountries.includes(userCountry)) return false;
        }
        if (ad.targetDevices && Array.isArray(ad.targetDevices) && ad.targetDevices.length > 0) {
          if (!ad.targetDevices.includes(userDevice)) return false;
        }
        // TODO: Age matching when users table adds age tracking
        return true;
      };

      const activePreRollAds = activePreRollAdsRaw.filter(filterAd);
      const activeMidRollAds = activeMidRollAdsRaw.filter(filterAd);
      const activePostRollAds = activePostRollAdsRaw.filter(filterAd);

      const customAds: any[] = [];
      const usedAdIds = new Set<string>();

      /*
        if (ad.duration > 20) {
          isSkippable = true;
          skipOffset = 20;
        } else if (skipOffset !== null && skipOffset > 0) {
          isSkippable = true;
        }
      */

      const processAd = (ad: any, startTime: number | null) => {
        // Trust the explicit database value set by the Admin
        const isSkippable = ad.isSkippable;
        // If it's not skippable, the player shouldn't receive a skipOffset
        const skipOffset = isSkippable ? ad.skipOffset : null;

        return {
          id: ad.id,
          title: ad.title,
          category: ad.category,
          startTime,
          endTime: null,
          uri: ad.uri,
          isSkippable,
          skipOffset,
          tracking: generateTracking(ad.id),
        };
      };

      // 1. PRE-ROLL
      const preRollPool = activePreRollAds.filter(ad => !usedAdIds.has(ad.id));
      if (preRollPool.length > 0) {
        const ad = preRollPool[Math.floor(Math.random() * preRollPool.length)];
        customAds.push(processAd(ad, 0));
        usedAdIds.add(ad.id);
      }

      // 2. MID-ROLL (Duration based calculation)
      let videoDuration = 0;
      if (videoId) {
        const videoRecord = await db.query.videos.findFirst({
          where: eq(videos.id, videoId)
        });
        if (videoRecord && videoRecord.duration) {
          videoDuration = Number(videoRecord.duration);
        }
      }

      const midRollPool = activeMidRollAds.filter(ad => !usedAdIds.has(ad.id));
      if (midRollPool.length > 0) {
        if (videoDuration > 0) {
          // 1 ad per 5 minutes (300 seconds)
          let numMidRolls = Math.floor(videoDuration / 300);
          
          // Enforce max 5 mid-rolls so user isn't spammed
          numMidRolls = Math.min(numMidRolls, 5);
          numMidRolls = Math.min(numMidRolls, midRollPool.length);

          for (let i = 1; i <= numMidRolls; i++) {
            // Evenly space them out, starting from the 5-minute mark
            const startTime = i * 300;
            if (startTime < videoDuration) {
              const availableAds = midRollPool.filter(ad => !usedAdIds.has(ad.id));
              if (availableAds.length > 0) {
                const ad = availableAds[Math.floor(Math.random() * availableAds.length)];
                customAds.push(processAd(ad, startTime));
                usedAdIds.add(ad.id);
              }
            }
          }
        } else {
          // Fallback: 1 random mid-roll if video duration is unknown
          const ad = midRollPool[Math.floor(Math.random() * midRollPool.length)];
          const randomStartTime = Math.floor(Math.random() * (120 - 30 + 1)) + 30;
          customAds.push(processAd(ad, randomStartTime));
          usedAdIds.add(ad.id);
        }
      }

      // 3. POST-ROLL
      const postRollPool = activePostRollAds.filter(ad => !usedAdIds.has(ad.id));
      if (postRollPool.length > 0) {
        const ad = postRollPool[Math.floor(Math.random() * postRollPool.length)];
        customAds.push(processAd(ad, null));
        usedAdIds.add(ad.id);
      }

      return { success: true, ads: customAds };
    },
    {
      query: t.Object({
        videoId: t.Optional(t.String()),
        deviceId: t.Optional(t.String()),
      }),
      detail: {
        summary: "Get Ads",
        description: "Fetch custom ads for a specific video",
        tags: ["Ads"],
      },
    }
  )
  .all(
    "/track",
    async ({ query, body, user }) => {
      // Handle both GET queries and POST body/queries
      const event = query?.event || (body as any)?.event;
      const adId = query?.adId || (body as any)?.adId;
      const deviceId = query?.deviceId || (body as any)?.deviceId;
      const userId = user?.id || null;

      if (event && adId) {
        try {
          await db.insert(adTracking).values({
            adId: adId as string,
            event: event as string,
            userId,
            deviceId: deviceId as string | undefined,
          });

          // Impression based budget tracking
          if (event === "impression") {
            await db.update(ads)
              .set({ spent: sql`${ads.spent} + 0.05` }) // Stub: 5 cents per impression
              .where(eq(ads.id, adId as string));
          }
          console.log(`[AD TRACKING DB] Logged '${event}' for Ad '${adId}'`);
        } catch (error) {
          console.error(`[AD TRACKING DB] Failed to log '${event}' for Ad '${adId}'`, error);
        }
      }

      return {
        success: true,
        tracked: { event, adId, timestamp: new Date().toISOString() },
      };
    },
    {
      detail: {
        summary: "Track Ad Events",
        description: "Track impressions, completes, skips, etc. for ads and save to database (supports GET and POST)",
        tags: ["Ads"],
      },
    }
  )
  .use(isAdmin) // The following routes are protected for Admins only
  .get(
    "/admin",
    async () => {
      const list = await db.query.ads.findMany({
        orderBy: (ads, { desc }) => [desc(ads.createdAt)],
      });
      return { success: true, ads: list };
    },
    {
      detail: {
        summary: "Get All Ads",
        description: "Fetch all ads for the admin dashboard",
        tags: ["Ads", "Admin"],
      },
    }
  )
  .post(
    "/admin",
    async ({ body }) => {
      const newAd = await db.insert(ads).values({
        title: body.title,
        category: body.category as any,
        format: body.format || "video",
        uri: body.uri,
        duration: body.duration || 0,
        minAge: body.minAge,
        maxAge: body.maxAge,
        targetCountries: body.targetCountries,
        targetGenders: body.targetGenders,
        targetCategories: body.targetCategories,
        targetDevices: body.targetDevices,
        budget: body.budget ? body.budget.toString() : null,
        isSkippable: body.isSkippable ?? true,
        skipOffset: body.skipOffset ?? 5,
        isActive: body.isActive ?? true,
      }).returning();
      
      return { success: true, ad: newAd[0] };
    },
    {
      body: t.Object({
        title: t.String(),
        category: t.String(),
        format: t.Optional(t.String()),
        uri: t.String(),
        duration: t.Optional(t.Number()),
        minAge: t.Optional(t.Nullable(t.Number())),
        maxAge: t.Optional(t.Nullable(t.Number())),
        targetCountries: t.Optional(t.Nullable(t.Array(t.String()))),
        targetGenders: t.Optional(t.Nullable(t.Array(t.String()))),
        targetCategories: t.Optional(t.Nullable(t.Array(t.String()))),
        targetDevices: t.Optional(t.Nullable(t.Array(t.String()))),
        budget: t.Optional(t.Nullable(t.Number())),
        isSkippable: t.Optional(t.Boolean()),
        skipOffset: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: "Create Ad",
        description: "Create a new ad",
        tags: ["Ads", "Admin"],
      },
    }
  )
  .put(
    "/admin/:id",
    async ({ params, body }) => {
      const { id } = params;
      
      const updatedAd = await db.update(ads).set({
        title: body.title,
        category: body.category as any,
        format: body.format,
        uri: body.uri,
        duration: body.duration,
        minAge: body.minAge,
        maxAge: body.maxAge,
        targetCountries: body.targetCountries,
        targetGenders: body.targetGenders,
        targetCategories: body.targetCategories,
        targetDevices: body.targetDevices,
        budget: body.budget !== undefined ? (body.budget === null ? null : body.budget.toString()) : undefined,
        isSkippable: body.isSkippable,
        skipOffset: body.skipOffset,
        isActive: body.isActive,
      }).where(eq(ads.id, id)).returning();
      
      return { success: true, ad: updatedAd[0] };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        category: t.Optional(t.String()),
        format: t.Optional(t.String()),
        uri: t.Optional(t.String()),
        duration: t.Optional(t.Number()),
        minAge: t.Optional(t.Nullable(t.Number())),
        maxAge: t.Optional(t.Nullable(t.Number())),
        targetCountries: t.Optional(t.Nullable(t.Array(t.String()))),
        targetGenders: t.Optional(t.Nullable(t.Array(t.String()))),
        targetCategories: t.Optional(t.Nullable(t.Array(t.String()))),
        targetDevices: t.Optional(t.Nullable(t.Array(t.String()))),
        budget: t.Optional(t.Nullable(t.Number())),
        isSkippable: t.Optional(t.Boolean()),
        skipOffset: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: "Update Ad",
        description: "Update an existing ad",
        tags: ["Ads", "Admin"],
      },
    }
  )
  .delete(
    "/admin/:id",
    async ({ params }) => {
      const { id } = params;
      await db.delete(ads).where(eq(ads.id, id));
      return { success: true, message: "Ad deleted" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "Delete Ad",
        description: "Delete an ad",
        tags: ["Ads", "Admin"],
      },
    }
  );
