import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const get = query({
  args: {
    category: v.optional(v.string()),
    source: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articles;
    
    if (args.category) {
      articles = await ctx.db
        .query("knowledge_articles")
        .withIndex("by_category", q => q.eq("category", args.category))
        .order("desc")
        .collect();
    } else {
      articles = await ctx.db
        .query("knowledge_articles")
        .order("desc")
        .collect();
    }
    
    if (args.source) {
      articles = articles.filter(article => article.source === args.source);
    }
    
    return args.limit ? articles.slice(0, args.limit) : articles;
  },
});

export const getUserPreferences = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_preferences")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
  },
});

export const updateUserPreferences = mutation({
  args: {
    userId: v.string(),
    selectedCategories: v.array(v.string()),
    selectedSources: v.array(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("user_preferences")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        selectedCategories: args.selectedCategories,
        selectedSources: args.selectedSources,
        language: args.language,
      });
    } else {
      await ctx.db.insert("user_preferences", {
        userId: args.userId,
        selectedCategories: args.selectedCategories,
        selectedSources: args.selectedSources,
        language: args.language,
      });
    }
  },
});

export const getAvailableCategories = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("knowledge_articles").collect();
    const categories = [...new Set(articles.map(a => a.category).filter((category): category is string => Boolean(category)))];
    return categories;
  },
});

export const getAvailableSources = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("knowledge_articles").collect();
    const sources = [...new Set(articles.map(a => a.source))];
    return sources;
  },
});

export const fetchTopStories = internalAction({
  handler: async (ctx) => {
    // Fetch from Hacker News
    try {
    const topStoriesResponse = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
      if (topStoriesResponse.ok) {
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
              category: "Tecnologia",
              publishedAt: story.time * 1000,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Hacker News:", error);
    }

    // Fetch from Reddit r/technology
    try {
      const redditResponse = await fetch(
        "https://www.reddit.com/r/technology/top.json?limit=10",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        }
      );
      if (redditResponse.ok) {
        const redditData = await redditResponse.json();
        
        for (const post of redditData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            // Use Reddit permalink for self posts, external URL for others
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Tech",
              sourceId: postData.id,
              score: postData.score,
              category: "Tecnologia",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit:", error);
    }

    // Fetch from Dev.to
    try {
      const devToResponse = await fetch(
        "https://dev.to/api/articles?per_page=10&top=1"
      );
      if (devToResponse.ok) {
        const devToArticles = await devToResponse.json();
        
        for (const article of devToArticles) {
          if (article && article.title && article.url) {
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: article.title,
              url: article.url,
              source: "Dev.to",
              sourceId: article.id.toString(),
              score: article.positive_reactions_count,
              category: "Programação",
              publishedAt: new Date(article.published_at).getTime(),
              description: article.description,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Dev.to:", error);
    }

    // Fetch from Reddit r/getmotivated (Produtividade/Motivação)
    try {
      const motivationRedditResponse = await fetch(
        "https://www.reddit.com/r/GetMotivated/top.json?limit=8"
      );
      if (motivationRedditResponse.ok) {
        const motivationData = await motivationRedditResponse.json();
        
        for (const post of motivationData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Motivação",
              sourceId: postData.id,
              score: postData.score,
              category: "Produtividade",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit GetMotivated:", error);
    }

    // Fetch from Reddit r/marketing
    try {
      const marketingRedditResponse = await fetch(
        "https://www.reddit.com/r/marketing/top.json?limit=8"
      );
      if (marketingRedditResponse.ok) {
        const marketingData = await marketingRedditResponse.json();
        
        for (const post of marketingData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Marketing",
              sourceId: postData.id,
              score: postData.score,
              category: "Marketing",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Marketing:", error);
    }

    // Fetch from Reddit r/productivity
    try {
      const productivityRedditResponse = await fetch(
        "https://www.reddit.com/r/productivity/top.json?limit=8"
      );
      if (productivityRedditResponse.ok) {
        const productivityData = await productivityRedditResponse.json();
        
        for (const post of productivityData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Produtividade",
              sourceId: postData.id,
              score: postData.score,
              category: "Produtividade",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Productivity:", error);
    }

    // Fetch from Reddit r/Music
    try {
      const musicRedditResponse = await fetch(
        "https://www.reddit.com/r/Music/top.json?limit=8"
      );
      if (musicRedditResponse.ok) {
        const musicData = await musicRedditResponse.json();
        
        for (const post of musicData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Música",
              sourceId: postData.id,
              score: postData.score,
              category: "Música",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Music:", error);
    }

    // Fetch from Reddit r/entrepreneur
    try {
      const entrepreneurRedditResponse = await fetch(
        "https://www.reddit.com/r/entrepreneur/top.json?limit=8"
      );
      if (entrepreneurRedditResponse.ok) {
        const entrepreneurData = await entrepreneurRedditResponse.json();
        
        for (const post of entrepreneurData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Negócios",
              sourceId: postData.id,
              score: postData.score,
              category: "Negócios",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Entrepreneur:", error);
    }

    // Fetch from Reddit r/design
    try {
      const designRedditResponse = await fetch(
        "https://www.reddit.com/r/design/top.json?limit=8"
      );
      if (designRedditResponse.ok) {
        const designData = await designRedditResponse.json();
        
        for (const post of designData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Design",
              sourceId: postData.id,
              score: postData.score,
              category: "Design",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Design:", error);
    }

    // Fetch from Reddit r/LifeProTips
    try {
      const lifeProTipsResponse = await fetch(
        "https://www.reddit.com/r/LifeProTips/top.json?limit=8"
      );
      if (lifeProTipsResponse.ok) {
        const lifeProTipsData = await lifeProTipsResponse.json();
        
        for (const post of lifeProTipsData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Dicas",
              sourceId: postData.id,
              score: postData.score,
              category: "Estilo de Vida",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit LifeProTips:", error);
    }

    // Fetch from Reddit r/science
    try {
      const scienceRedditResponse = await fetch(
        "https://www.reddit.com/r/science/top.json?limit=8"
      );
      if (scienceRedditResponse.ok) {
        const scienceData = await scienceRedditResponse.json();
        
        for (const post of scienceData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Ciência",
              sourceId: postData.id,
              score: postData.score,
              category: "Ciência",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Science:", error);
    }

    // Fetch from Reddit r/photography
    try {
      const photographyRedditResponse = await fetch(
        "https://www.reddit.com/r/photography/top.json?limit=8"
      );
      if (photographyRedditResponse.ok) {
        const photographyData = await photographyRedditResponse.json();
        
        for (const post of photographyData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Fotografia",
              sourceId: postData.id,
              score: postData.score,
              category: "Fotografia",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Photography:", error);
    }

    // Fetch from Reddit r/personalfinance
    try {
      const financeRedditResponse = await fetch(
        "https://www.reddit.com/r/personalfinance/top.json?limit=8"
      );
      if (financeRedditResponse.ok) {
        const financeData = await financeRedditResponse.json();
        
        for (const post of financeData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Finanças",
              sourceId: postData.id,
              score: postData.score,
              category: "Finanças",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit PersonalFinance:", error);
    }

    // Fetch from Reddit r/fitness
    try {
      const fitnessRedditResponse = await fetch(
        "https://www.reddit.com/r/fitness/top.json?limit=8"
      );
      if (fitnessRedditResponse.ok) {
        const fitnessData = await fitnessRedditResponse.json();
        
        for (const post of fitnessData.data.children) {
          const postData = post.data;
          if (postData && postData.title) {
            const url = postData.is_self 
              ? `https://www.reddit.com${postData.permalink}`
              : postData.url;
            
            await ctx.runMutation(internal.knowledge.internalStoreArticle, {
              title: postData.title,
              url: url,
              source: "Reddit Fitness",
              sourceId: postData.id,
              score: postData.score,
              category: "Saúde",
              publishedAt: postData.created_utc * 1000,
              description: postData.selftext ? postData.selftext.substring(0, 200) : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch from Reddit Fitness:", error);
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
        category: v.optional(v.string()),
        publishedAt: v.optional(v.number()),
        description: v.optional(v.string()),
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
                score: args.score,
                category: args.category,
                publishedAt: args.publishedAt,
                description: args.description,
            });
        }
    }
}); 