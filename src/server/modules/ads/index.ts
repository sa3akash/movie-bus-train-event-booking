import { Elysia, t } from "elysia";
import { db } from "../../db";
import { ads } from "../../db/schemas/ads";
import { eq, and, sql } from "drizzle-orm";
import { isAdmin } from "../../middlewares/auth";

import { adTracking } from "../../db/schemas/ads";

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
  .get(
    "/",
    async ({ query }) => {
      const { videoId } = query;

      // Fetch active ads randomly
      // We will try to get 1 PRE_ROLL and 1 MID_ROLL ad
      
      const activePreRollAds = await db.query.ads.findMany({
        where: and(eq(ads.isActive, true), eq(ads.category, "PRE_ROLL")),
        orderBy: sql`RANDOM()`,
        limit: 1,
      });

      const activeMidRollAds = await db.query.ads.findMany({
        where: and(eq(ads.isActive, true), eq(ads.category, "MID_ROLL")),
        orderBy: sql`RANDOM()`,
        limit: 1,
      });

      const activePostRollAds = await db.query.ads.findMany({
        where: and(eq(ads.isActive, true), eq(ads.category, "POST_ROLL")),
        orderBy: sql`RANDOM()`,
        limit: 1,
      });

      const customAds = [];

      if (activePreRollAds.length > 0) {
        const ad = activePreRollAds[0];
        customAds.push({
          id: ad.id,
          category: ad.category,
          startTime: 0,
          endTime: null,
          uri: ad.uri,
          isSkippable: (ad.skipOffset !== null && ad.skipOffset > 0) ? true : ad.isSkippable,
          skipOffset: ad.skipOffset,
          tracking: generateTracking(ad.id),
        });
      }

      if (activeMidRollAds.length > 0) {
        const ad = activeMidRollAds[0];
        // Randomize mid-roll start time between 30 and 120 seconds for demonstration
        const randomStartTime = Math.floor(Math.random() * (120 - 30 + 1)) + 30;
        customAds.push({
          id: ad.id,
          category: ad.category,
          startTime: randomStartTime,
          endTime: null,
          uri: ad.uri,
          isSkippable: (ad.skipOffset !== null && ad.skipOffset > 0) ? true : ad.isSkippable,
          skipOffset: ad.skipOffset,
          tracking: generateTracking(ad.id),
        });
      }

      if (activePostRollAds.length > 0) {
        const ad = activePostRollAds[0];
        customAds.push({
          id: ad.id,
          category: ad.category,
          startTime: null, // POST_ROLL relies on the `post: true` flag, not a start time
          endTime: null,
          uri: ad.uri,
          isSkippable: (ad.skipOffset !== null && ad.skipOffset > 0) ? true : ad.isSkippable,
          skipOffset: ad.skipOffset,
          tracking: generateTracking(ad.id),
        });
      }

      return { success: true, ads: customAds };
    },
    {
      query: t.Object({
        videoId: t.Optional(t.String()),
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
    async ({ query, body }) => {
      // Handle both GET queries and POST body/queries
      const event = query?.event || (body as any)?.event;
      const adId = query?.adId || (body as any)?.adId;

      if (event && adId) {
        try {
          await db.insert(adTracking).values({
            adId: adId as string,
            event: event as string,
          });
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
        uri: body.uri,
        isSkippable: body.isSkippable,
        skipOffset: body.skipOffset,
        isActive: body.isActive,
      }).returning();
      
      return { success: true, ad: newAd[0] };
    },
    {
      body: t.Object({
        title: t.String(),
        category: t.String(),
        uri: t.String(),
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
        uri: body.uri,
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
        uri: t.Optional(t.String()),
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
