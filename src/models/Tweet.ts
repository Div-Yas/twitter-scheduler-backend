import mongoose, { Schema, Document } from "mongoose";

export type TweetStatus = "draft" | "scheduled" | "posted";

export interface ITweet extends Document {
  content: string;
  scheduledAt: Date;
  status: TweetStatus;
  user: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  media?: string[];
  likes: number;
  retweets: number;
  impressions: number;
}

const tweetSchema = new Schema<ITweet>(
  {
    content: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ["draft", "scheduled", "posted"], default: "draft" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    media: { type: [String], default: [] },
    likes: { type: Number, default: 0 },
    retweets: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<ITweet>("Tweet", tweetSchema);
