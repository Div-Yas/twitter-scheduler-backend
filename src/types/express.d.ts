import type mongoose from "mongoose";

declare global {
  namespace Express {
    interface User {
      _id: mongoose.Types.ObjectId;
      email: string;
    }
    interface Request {
      user: User;
    }
  }
}

export {};

