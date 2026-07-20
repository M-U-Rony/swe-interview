import mongoose from "mongoose";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.warn("Please provide MONGODB_URL environment variable inside .env");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (!MONGODB_URL) return;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL).then((mongooseInstance) => {
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