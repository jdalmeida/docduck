"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

export const summarizeArticle = action({
    args: {
        url: v.string(),
    },
    handler: async (_ctx, { url }): Promise<string | null> => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable not set.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        try {
            // Fetch and parse the article content
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);
            const articleText = $("p").text();

            if (!articleText) {
                console.warn(`No content found for ${url}`);
                return null;
            }

            // Generate summary with Gemini
            const prompt = `Please provide a summary of the following article text:\n\n${articleText}`;
            const result = await model.generateContent(prompt);
            return result.response.text();

        } catch (error) {
            console.error("Error summarizing article:", error);
            return null;
        }
    },
}); 