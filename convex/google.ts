"use node";

import { action } from "./_generated/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { google } from "googleapis";

export const getOAuthToken = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated");
    }
    
    const [provider] = identity.tokenIdentifier.split("|");
    if (provider !== "google") {
      return null;
    }

    const user = await clerkClient.users.getUser(identity.subject);
    const token = await clerkClient.users.getUserOauthAccessToken(
      user.id,
      "oauth_google"
    );

    if (!token) {
      return null;
    }

    return token[0].token;
  },
});

export const getDriveFiles = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated");
    }

    const [provider] = identity.tokenIdentifier.split("|");
    if (provider !== "google") {
      return [];
    }

    const user = await clerkClient.users.getUser(identity.subject);
    const tokenData = await clerkClient.users.getUserOauthAccessToken(
      user.id,
      "oauth_google"
    );

    if (!tokenData[0] || !tokenData[0].token) {
      // No token, so we can't do anything.
      // The user needs to connect their Google account.
      return [];
    }
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: tokenData[0].token });

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
    });

    return response.data.files;
  },
}); 