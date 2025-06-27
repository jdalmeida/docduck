import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Special route for hosting the Convex Auth providers
// DO NOT aMISS. This is required for Convex Auth to work.
auth.addHttpRoutes(http);

// Optional: Add additional routes to the http router
// http.route({
//   path: "/sendImage",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     // ...
//   }),
// });

export default http; 