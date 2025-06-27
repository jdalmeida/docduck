import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch knowledge articles",
  { minutes: 30 }, // Fetch every 30 minutes
  internal.knowledge.fetchTopStories
);

export default crons; 