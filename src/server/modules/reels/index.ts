import { Elysia, t } from "elysia";
import { db } from "../../db";
import { reels, reelLikes, reelShares, reelComments, reelCommentLikes, savedReels, reelSeries } from "../../db/schemas/reels";
import { userFollowers } from "../../db/schemas/users";
import { eq, desc, asc, and, ilike, inArray, lt, isNull } from "drizzle-orm";
import { isAuthenticated } from "../../middlewares/auth";
import { redisConnection } from "../../queue";

// Helper to extract hashtags from caption
const extractHashtags = (text: string) => {
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.map((tag) => tag.replace("#", "")) : [];
};

export const reelsModule = new Elysia({ prefix: "/reels" })
  .get(
    "/",
    async ({ user, query }) => {
      const limit = Number(query.limit) || 10;
      const cursorId = query.cursor;
      const initialReelId = query.initialReelId;
      
      // Simulate auth for queue key
      const userId = user?.id || 'guest';
      const queueKey = `feed:queue:${userId}`;
      
      let reelIds: string[] = [];
      
      // 1. Pop from Redis List (O(1))
      reelIds = await redisConnection.lrange(queueKey, 0, limit - 1);
      
      // 2. Replenish Queue if empty
      if (reelIds.length === 0) {
        let whereClause: any = and(
          eq(reels.visibility, "PUBLIC"),
          isNull(reels.seriesId)
        );
        
        // If we have a cursor from the last batch, use it to fetch older reels
        if (cursorId && cursorId !== "has_more") {
           const date = new Date(cursorId);
           if (!isNaN(date.getTime())) {
             whereClause = and(whereClause, lt(reels.createdAt, date));
           }
        }

        // Query next large batch of reels
        const pool = await db.query.reels.findMany({
          where: whereClause,
          orderBy: [desc(reels.createdAt)],
          limit: 100,
          columns: { id: true }
        });
        
        const newIds = pool.map(r => r.id);
        
        if (newIds.length > 0) {
          await redisConnection.rpush(queueKey, ...newIds);
          await redisConnection.expire(queueKey, 3600); // 1 hour expiry
          reelIds = await redisConnection.lrange(queueKey, 0, limit - 1);
        }
      }
      
      if (reelIds.length > 0) {
        await redisConnection.ltrim(queueKey, reelIds.length, -1);
      }
      
      if (reelIds.length === 0) {
        return { success: true, reels: [], nextCursor: null };
      }

      // 3. Fast primary-key lookup
      const fetchedReels = await db.query.reels.findMany({
        where: inArray(reels.id, reelIds),
        with: {
          user: { columns: { id: true, name: true, avatarId: true } },
          video: true,
          series: true,
        },
      });

      // Maintain order prescribed by Redis
      let orderedReels = reelIds.map(id => fetchedReels.find(r => r.id === id)).filter(Boolean) as any[];

      // If this is the initial load with a specific deep-linked reel
      if (initialReelId && !cursorId) {
         const specificReel = await db.query.reels.findFirst({
           where: eq(reels.id, initialReelId),
           with: { user: { columns: { id: true, name: true, avatarId: true } }, video: true, series: true }
         });
         
         if (specificReel) {
           // Remove it if it happens to be in the batch
           orderedReels = orderedReels.filter(r => r.id !== initialReelId);
           // Put it at the very top of the feed
           orderedReels.unshift(specificReel);
           // Keep it to the requested limit
           orderedReels = orderedReels.slice(0, limit);
         }
      }

      // Extract the real cursor (timestamp of the last reel in this batch)
      const lastReel = orderedReels[orderedReels.length - 1];
      const nextCursor = (orderedReels.length === limit && lastReel) 
        ? lastReel.createdAt.toISOString() 
        : null;

      return { success: true, reels: orderedReels, nextCursor };
    },
    {
      query: t.Optional(
        t.Object({
          limit: t.Optional(t.String()),
          cursor: t.Optional(t.String()),
          initialReelId: t.Optional(t.String()),
        })
      ),
      detail: { summary: "Get Reels Feed (Redis Queue)", tags: ["Reels"] },
    }
  )
  .get(
    "/series",
    async ({ query }) => {
      const limit = Number(query.limit) || 20;
      const list = await db.query.reelSeries.findMany({
        limit,
        orderBy: [desc(reelSeries.createdAt)],
        with: {
           user: { columns: { id: true, name: true, avatarId: true } },
        }
      });
      return { success: true, series: list };
    },
    {
       query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
       detail: { summary: "Get all Series", tags: ["Reels", "Series"] },
    }
  )
  .get(
    "/series/:id",
    async ({ params, set }) => {
      const series = await db.query.reelSeries.findFirst({
        where: eq(reelSeries.id, params.id),
        with: {
           user: { columns: { id: true, name: true, avatarId: true } },
        }
      });
      if (!series) {
        set.status = 404;
        return { error: "Series not found" };
      }
      return { success: true, series };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Get Series Details", tags: ["Reels", "Series"] },
    }
  )
  .get(
    "/series/:id/episodes",
    async ({ params, set }) => {
      const list = await db.query.reels.findMany({
        where: eq(reels.seriesId, params.id),
        orderBy: [asc(reels.episodeNumber)],
        with: {
           video: true,
           user: { columns: { id: true, name: true, avatarId: true } },
           series: true,
        }
      });
      return { success: true, episodes: list };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Get Series Episodes", tags: ["Reels", "Series"] },
    }
  )
  .get(
    "/hashtag/:tag",
    async ({ params, query }) => {
      const limit = Number(query.limit) || 10;
      const cursor = query.cursor;

      let whereClause: any = and(
        eq(reels.visibility, "PUBLIC"),
        ilike(reels.caption, `%#${params.tag}%`)
      );
      
      if (cursor) {
        whereClause = and(whereClause, lt(reels.createdAt, new Date(cursor)));
      }

      const list = await db.query.reels.findMany({
        limit,
        orderBy: [desc(reels.createdAt)],
        where: whereClause,
        with: {
          user: { columns: { id: true, name: true, avatarId: true } },
          video: true,
        },
      });

      const nextCursor = list.length === limit ? list[list.length - 1].createdAt.toISOString() : null;
      return { success: true, reels: list, nextCursor };
    },
    {
      params: t.Object({ tag: t.String() }),
      query: t.Optional(
        t.Object({
          limit: t.Optional(t.String()),
          cursor: t.Optional(t.String()),
        })
      ),
      detail: { summary: "Get Reels By Hashtag (Cursor Pagination)", tags: ["Reels"] },
    }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const reel = await db.query.reels.findFirst({
        where: eq(reels.id, params.id),
        with: {
          user: { columns: { id: true, name: true, avatarId: true } },
          video: true,
          series: true,
        },
      });

      if (!reel) {
        set.status = 404;
        return { error: "Reel not found" };
      }

      // Increment views count asynchronously
      db.update(reels)
        .set({ viewsCount: (reel.viewsCount || 0) + 1 })
        .where(eq(reels.id, reel.id))
        .execute()
        .catch(console.error);

      return { success: true, reel };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Get Single Reel", tags: ["Reels"] },
    }
  )
  .get(
    "/:id/comments",
    async ({ params, query }) => {
      const limit = Number(query.limit) || 50; // increased for nested viewing
      const offset = Number(query.offset) || 0;

      const list = await db.query.reelComments.findMany({
        where: eq(reelComments.reelId, params.id),
        limit,
        offset,
        orderBy: [desc(reelComments.createdAt)],
        with: {
          user: { columns: { id: true, name: true, avatarId: true } },
        },
      });

      return { success: true, comments: list };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(
        t.Object({
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String()),
        })
      ),
      detail: { summary: "Get Reel Comments", tags: ["Reels"] },
    }
  )
  .use(isAuthenticated) // Require auth for below actions
  .post(
    "/",
    async ({ body, user }) => {
      const hashtags = extractHashtags(body.caption || "");

      const [newReel] = await db
        .insert(reels)
        .values({
          userId: user.id,
          videoId: body.videoId,
          caption: body.caption,
          visibility: body.visibility || "PUBLIC",
          allowComments: body.allowComments ?? true,
          allowRemixing: body.allowRemixing ?? true,
          hashtags,
          seriesId: body.seriesId,
          seasonNumber: body.seasonNumber,
          episodeNumber: body.episodeNumber,
          episodeTitle: body.episodeTitle,
          isPremium: body.isPremium,
          unlockPrice: body.unlockPrice,
        })
        .returning();

      return { success: true, reel: newReel };
    },
    {
      body: t.Object({
        videoId: t.String(),
        caption: t.Optional(t.String()),
        visibility: t.Optional(t.String()),
        allowComments: t.Optional(t.Boolean()),
        allowRemixing: t.Optional(t.Boolean()),
        seriesId: t.Optional(t.String()),
        seasonNumber: t.Optional(t.Number()),
        episodeNumber: t.Optional(t.Number()),
        episodeTitle: t.Optional(t.String()),
        isPremium: t.Optional(t.Boolean()),
        unlockPrice: t.Optional(t.Number()),
      }),
      detail: { summary: "Create Reel", tags: ["Reels"] },
    }
  )
  .post(
    "/series",
    async ({ body, user }) => {
      const [newSeries] = await db
        .insert(reelSeries)
        .values({
          title: body.title,
          description: body.description,
          coverImageId: body.coverImageId,
          trailerVideoId: body.trailerVideoId,
          genre: body.genre,
          status: body.status,
          totalEpisodes: body.totalEpisodes,
          isPremium: body.isPremium,
          defaultPricePerEpisode: body.defaultPricePerEpisode,
          tags: body.tags,
          cast: body.cast,
          director: body.director,
          releaseYear: body.releaseYear,
          language: body.language,
          ageRating: body.ageRating,
          userId: user.id,
        })
        .returning();
      return { success: true, series: newSeries };
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        coverImageId: t.Optional(t.String()),
        trailerVideoId: t.Optional(t.String()),
        genre: t.Optional(t.String()),
        status: t.Optional(t.String()),
        totalEpisodes: t.Optional(t.Number()),
        isPremium: t.Optional(t.Boolean()),
        defaultPricePerEpisode: t.Optional(t.Number()),
        tags: t.Optional(t.Array(t.String())),
        cast: t.Optional(t.Array(t.String())),
        director: t.Optional(t.String()),
        releaseYear: t.Optional(t.Number()),
        language: t.Optional(t.String()),
        ageRating: t.Optional(t.String()),
      }),
      detail: { summary: "Create Reel Series", tags: ["Reels", "Series"] },
    }
  )
  .post(
    "/bulk",
    async ({ body, user }) => {
      const seriesId = body.seriesId;
      let nextEpisodeNumber = 1;
      const lastEpisode = await db.query.reels.findFirst({
        where: eq(reels.seriesId, seriesId),
        orderBy: [desc(reels.episodeNumber)]
      });
      if (lastEpisode && lastEpisode.episodeNumber) {
         nextEpisodeNumber = lastEpisode.episodeNumber + 1;
      }
      
      const insertData = body.episodes.map((ep, index) => {
         const hashtags = extractHashtags(ep.caption || "");
         return {
           userId: user.id,
           videoId: ep.videoId,
           caption: ep.caption,
           visibility: ep.visibility || "PUBLIC",
           seriesId: seriesId,
           seasonNumber: ep.seasonNumber || 1,
           episodeNumber: nextEpisodeNumber + index,
           episodeTitle: ep.episodeTitle,
           isPremium: ep.isPremium || false,
           unlockPrice: ep.unlockPrice,
           hashtags
         };
      });
      
      const newReels = await db.insert(reels).values(insertData).returning();
      return { success: true, count: newReels.length, reels: newReels };
    },
    {
      body: t.Object({
        seriesId: t.String(),
        episodes: t.Array(t.Object({
           videoId: t.String(),
           caption: t.Optional(t.String()),
           visibility: t.Optional(t.String()),
           seasonNumber: t.Optional(t.Number()),
           episodeTitle: t.Optional(t.String()),
           isPremium: t.Optional(t.Boolean()),
           unlockPrice: t.Optional(t.Number())
        }))
      }),
      detail: { summary: "Bulk Create Series Episodes", tags: ["Reels", "Series"] },
    }
  )
  .get(
    "/saved",
    async ({ user, query }) => {
      const limit = Number(query.limit) || 10;
      const cursor = query.cursor;

      let whereClause: any = eq(savedReels.userId, user.id);
      
      if (cursor) {
        whereClause = and(whereClause, lt(savedReels.createdAt, new Date(cursor)));
      }

      const list = await db.query.savedReels.findMany({
        where: whereClause,
        limit,
        orderBy: [desc(savedReels.createdAt)],
        with: {
          reel: {
            with: {
              user: { columns: { id: true, name: true, avatarId: true } },
              video: true,
            }
          }
        },
      });

      const nextCursor = list.length === limit ? list[list.length - 1].createdAt.toISOString() : null;
      return { success: true, reels: list.map(s => s.reel), nextCursor };
    },
    {
      query: t.Optional(t.Object({ limit: t.Optional(t.String()), cursor: t.Optional(t.String()) })),
      detail: { summary: "Get Saved Reels (Cursor Pagination)", tags: ["Reels"] }
    }
  )
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const reel = await db.query.reels.findFirst({ where: eq(reels.id, params.id) });
      if (!reel) {
        set.status = 404;
        return { error: "Reel not found" };
      }
      if (reel.userId !== user.id) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      await db.delete(reels).where(eq(reels.id, params.id));
      return { success: true };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Delete Reel", tags: ["Reels"] },
    }
  )
  .post(
    "/:id/like",
    async ({ params, user }) => {
      const reel = await db.query.reels.findFirst({ where: eq(reels.id, params.id) });
      if (!reel) return { error: "Reel not found" };

      const existingLike = await db.query.reelLikes.findFirst({
        where: and(eq(reelLikes.reelId, params.id), eq(reelLikes.userId, user.id)),
      });

      if (existingLike) {
        await db.delete(reelLikes).where(eq(reelLikes.id, existingLike.id));
        await db.update(reels).set({ likesCount: Math.max((reel.likesCount || 0) - 1, 0) }).where(eq(reels.id, params.id));
        return { success: true, liked: false };
      }

      await db.insert(reelLikes).values({ reelId: params.id, userId: user.id });
      await db.update(reels).set({ likesCount: (reel.likesCount || 0) + 1 }).where(eq(reels.id, params.id));
      return { success: true, liked: true };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Toggle Like Reel", tags: ["Reels"] },
    }
  )
  .post(
    "/:id/save",
    async ({ params, user }) => {
      const reel = await db.query.reels.findFirst({ where: eq(reels.id, params.id) });
      if (!reel) return { error: "Reel not found" };

      const existingSave = await db.query.savedReels.findFirst({
        where: and(eq(savedReels.reelId, params.id), eq(savedReels.userId, user.id)),
      });

      if (existingSave) {
        await db.delete(savedReels).where(eq(savedReels.id, existingSave.id));
        await db.update(reels).set({ savesCount: Math.max((reel.savesCount || 0) - 1, 0) }).where(eq(reels.id, params.id));
        return { success: true, saved: false };
      }

      await db.insert(savedReels).values({ reelId: params.id, userId: user.id });
      await db.update(reels).set({ savesCount: (reel.savesCount || 0) + 1 }).where(eq(reels.id, params.id));
      return { success: true, saved: true };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Toggle Save Reel", tags: ["Reels"] },
    }
  )
  .post(
    "/:id/share",
    async ({ params, user }) => {
      const reel = await db.query.reels.findFirst({ where: eq(reels.id, params.id) });
      if (!reel) return { error: "Reel not found" };

      await db.insert(reelShares).values({ reelId: params.id, userId: user.id, platform: "copy_link" });
      await db.update(reels).set({ sharesCount: (reel.sharesCount || 0) + 1 }).where(eq(reels.id, params.id));
      
      return { success: true };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Share Reel", tags: ["Reels"] },
    }
  )
  .post(
    "/:id/comments",
    async ({ params, body, user }) => {
      const reel = await db.query.reels.findFirst({ where: eq(reels.id, params.id) });
      if (!reel) return { error: "Reel not found" };

      const [newComment] = await db
        .insert(reelComments)
        .values({
          reelId: params.id,
          userId: user.id,
          content: body.content,
          parentId: body.parentId,
        })
        .returning();

      await db.update(reels).set({ commentsCount: (reel.commentsCount || 0) + 1 }).where(eq(reels.id, params.id));

      return { success: true, comment: newComment };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ 
        content: t.String(),
        parentId: t.Optional(t.String()),
      }),
      detail: { summary: "Add Reel Comment", tags: ["Reels"] },
    }
  )
  .post(
    "/comments/:commentId/like",
    async ({ params, user }) => {
      const comment = await db.query.reelComments.findFirst({ where: eq(reelComments.id, params.commentId) });
      if (!comment) return { error: "Comment not found" };

      const existingLike = await db.query.reelCommentLikes.findFirst({
        where: and(eq(reelCommentLikes.commentId, params.commentId), eq(reelCommentLikes.userId, user.id)),
      });

      if (existingLike) {
        await db.delete(reelCommentLikes).where(eq(reelCommentLikes.id, existingLike.id));
        await db.update(reelComments).set({ likesCount: Math.max((comment.likesCount || 0) - 1, 0) }).where(eq(reelComments.id, params.commentId));
        return { success: true, liked: false };
      }

      await db.insert(reelCommentLikes).values({ commentId: params.commentId, userId: user.id });
      await db.update(reelComments).set({ likesCount: (comment.likesCount || 0) + 1 }).where(eq(reelComments.id, params.commentId));
      
      return { success: true, liked: true };
    },
    {
      params: t.Object({ commentId: t.String() }),
      detail: { summary: "Toggle Like Comment", tags: ["Reels"] },
    }
  )
  .post(
    "/users/:id/follow",
    async ({ params, user, set }) => {
      if (params.id === user.id) {
        set.status = 400;
        return { error: "Cannot follow yourself" };
      }

      const existingFollow = await db.query.userFollowers.findFirst({
        where: and(eq(userFollowers.followerId, user.id), eq(userFollowers.followingId, params.id)),
      });

      if (existingFollow) {
        await db.delete(userFollowers).where(eq(userFollowers.id, existingFollow.id));
        return { success: true, following: false };
      }

      await db.insert(userFollowers).values({ followerId: user.id, followingId: params.id });
      return { success: true, following: true };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Toggle Follow User", tags: ["Reels", "Users"] },
    }
  );
