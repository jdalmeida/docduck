import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Fetch top stories from Hacker News",
  { hours: 1 },
  internal.knowledge.fetchTopStories
);

export default crons; 