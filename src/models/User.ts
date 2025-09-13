import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  _id: mongoose.Types.ObjectId;
  timeZone?: string;
  googleId?: string;
  name?: string;
  avatar?: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function(this: any) { return !this.googleId; } },
  timeZone: { type: String, default: "UTC" },
  googleId: { type: String },
  name: { type: String },
  avatar: { type: String }
});

export default mongoose.model<IUser>("User", userSchema);
