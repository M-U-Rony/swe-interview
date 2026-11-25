import mongoose from "mongoose";
import dns from "node:dns/promises";
import { env } from "@/lib/env";
dns.setServers(["1.1.1.1"]);

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env().MONGODB_URL).then((mongooseInstance) => {
      console.log("DB Connected (New Connection established)");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("Error in DB connection:", error);
    throw error;
  }

  return cached.conn;
}