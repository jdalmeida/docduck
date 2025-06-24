import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("knowledge_articles").order("desc").collect();
  },
});

export const fetchTopStories = internalAction({
  handler: async (ctx) => {
    const topStoriesResponse = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    if (!topStoriesResponse.ok) {
      throw new Error("Failed to fetch top stories from Hacker News");
    }
    const topStoryIds = await topStoriesResponse.json();

    // Fetch details for the top 10 stories
    for (const storyId of topStoryIds.slice(0, 10)) {
      const storyResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
      );
      if (!storyResponse.ok) {
        console.error(`Failed to fetch story ${storyId}`);
        continue;
      }
      const story = await storyResponse.json();
      if (story && story.title && story.url) {
        await ctx.runMutation(internal.knowledge.internalStoreArticle, {
          title: story.title,
          url: story.url,
          source: "Hacker News",
          sourceId: story.id.toString(),
          score: story.score,
        });
      }
    }
  },
});

export const internalStoreArticle = internalMutation({
    args: {
        title: v.string(),
        url: v.string(),
        source: v.string(),
        sourceId: v.string(),
        score: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("knowledge_articles")
            .withIndex("by_source_id", q => q.eq("sourceId", args.sourceId))
            .first();

        if (!existing) {
            await ctx.db.insert("knowledge_articles", {
                title: args.title,
                url: args.url,
                source: args.source,
                sourceId: args.sourceId,
                score: args.score
            });
        }
    }
}); 