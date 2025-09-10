import cron, { ScheduledTask } from "node-cron";
import Tweet, { ITweet } from "../models/Tweet";
import { io } from "../server";

const jobStore = new Map<string, ScheduledTask>();

export const scheduleTweet = (tweet: ITweet) => {
  const time = new Date(tweet.scheduledAt);
  const cronExp = `${time.getMinutes()} ${time.getHours()} ${time.getDate()} ${time.getMonth() + 1} *`;

  cancelTweetSchedule(tweet._id.toString());

  const task = cron.schedule(cronExp, async () => {
    try {
      const updated = await Tweet.findByIdAndUpdate(tweet._id, { status: "posted", impressions: Math.floor(Math.random()*1000), likes: Math.floor(Math.random()*300), retweets: Math.floor(Math.random()*150) }, { new: true });
      io.emit("tweet:posted", { id: tweet._id.toString(), tweet: updated });
      console.log(`Tweet posted: ${tweet.content}`);
    } finally {
      cancelTweetSchedule(tweet._id.toString());
    }
  });

  jobStore.set(tweet._id.toString(), task);
  console.log(`Scheduled: ${tweet.content} at ${time}`);
};

export const cancelTweetSchedule = (tweetId: string) => {
  const task = jobStore.get(tweetId);
  if (task) {
    task.stop();
    jobStore.delete(tweetId);
  }
};
