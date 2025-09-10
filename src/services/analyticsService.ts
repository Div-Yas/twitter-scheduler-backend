import { ITweet } from "../models/Tweet";

export type PerformanceBucket = "viral" | "performing" | "underperforming";

export const scoreTweet = (tweet: ITweet): { score: number; bucket: PerformanceBucket } => {
  // Simple scoring: impressions carry most weight, likes/retweets amplify
  const score = tweet.impressions * 0.5 + tweet.likes * 2 + tweet.retweets * 3;
  let bucket: PerformanceBucket = "underperforming";
  if (score >= 1000) bucket = "viral"; else if (score >= 200) bucket = "performing";
  return { score, bucket };
};

export const summarize = (tweets: ITweet[]) => {
  const scored = tweets.map(t => ({ id: t._id.toString(), ...scoreTweet(t) }));
  const counts = scored.reduce(
    (acc, t) => {
      acc.total += 1;
      acc[t.bucket] += 1;
      return acc;
    },
    { total: 0, viral: 0, performing: 0, underperforming: 0 }
  );
  return { counts, scored };
};

export default scoreTweet;

