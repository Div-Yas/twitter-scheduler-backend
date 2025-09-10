import { Request, Response } from "express";
import Tweet, { ITweet, TweetStatus } from "../models/Tweet";
import { scheduleTweet, cancelTweetSchedule } from "../services/tweetScheduler";
import { minutesBetween } from "../utils/time";
import { io } from "../server";

export const createTweet = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, data: null, message: "Not authorized" });
    const { content, scheduledAt, status, media } = req.body as { content: string; scheduledAt: string; status?: TweetStatus; media?: string[] };
    const parsedDate = new Date(scheduledAt);
    // Conflict detection: prevent scheduling within 2 minutes of another scheduled tweet by this user
    const near = await Tweet.findOne({ user: req.user._id, status: "scheduled" }).sort({ scheduledAt: -1 }).limit(1);
    if (near && minutesBetween(near.scheduledAt, parsedDate) < 2) {
      return res.status(400).json({ success: false, data: null, message: "Scheduling conflict: choose a time at least 2 minutes apart" });
    }
    const tweet = await Tweet.create({ content, scheduledAt: parsedDate, user: req.user._id, status: status ?? "draft", media } as Partial<ITweet>);
    if (tweet.status === "scheduled") {
      scheduleTweet(tweet as ITweet);
      io.emit("tweet:scheduled", { id: tweet._id.toString(), at: tweet.scheduledAt });
    }
    return res.status(201).json({ success: true, data: tweet, message: "Tweet created" });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const getTweets = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, data: null, message: "Not authorized" });
    const tweets = await Tweet.find({ user: req.user._id });
    return res.json({ success: true, data: tweets, message: "Tweets fetched" });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const updateTweet = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, data: null, message: "Not authorized" });
    const { id } = req.params as { id: string };
    const { content, scheduledAt, status, media } = req.body as { content?: string; scheduledAt?: string; status?: TweetStatus; media?: string[] };
    const tweet = await Tweet.findOne({ _id: id, user: req.user._id });
    if (!tweet) return res.status(404).json({ success: false, data: null, message: "Tweet not found" });

    if (typeof content === "string") tweet.content = content;
    if (scheduledAt) {
      const nextDate = new Date(scheduledAt);
      const near = await Tweet.findOne({ user: req.user._id, status: "scheduled", _id: { $ne: tweet._id } }).sort({ scheduledAt: -1 }).limit(1);
      if (near && minutesBetween(near.scheduledAt, nextDate) < 2) {
        return res.status(400).json({ success: false, data: null, message: "Scheduling conflict: choose a time at least 2 minutes apart" });
      }
      tweet.scheduledAt = nextDate;
    }
    if (status) tweet.status = status;
    if (Array.isArray(media)) tweet.media = media;

    await tweet.save();

    cancelTweetSchedule(tweet._id.toString());
    if (tweet.status === "scheduled") scheduleTweet(tweet as ITweet);

    const response = { success: true, data: tweet, message: "Tweet updated" };
    if (tweet.status === "scheduled") {
      io.emit("tweet:scheduled", { id: tweet._id.toString(), at: tweet.scheduledAt });
    }
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export const deleteTweet = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, data: null, message: "Not authorized" });
    const { id } = req.params as { id: string };
    const tweet = await Tweet.findOneAndDelete({ _id: id, user: req.user._id });
    if (!tweet) return res.status(404).json({ success: false, data: null, message: "Tweet not found" });
    cancelTweetSchedule(tweet._id.toString());
    io.emit("tweet:deleted", { id: tweet._id.toString() });
    return res.json({ success: true, data: null, message: "Tweet deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};
