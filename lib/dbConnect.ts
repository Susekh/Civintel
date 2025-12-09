import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

export async function connectDB(): Promise<void> {
  if (connection.isConnected) {
    return;
  }

  // If already connected OR connecting, reuse it
  if (mongoose.connection.readyState >= 1) {
    connection.isConnected = mongoose.connection.readyState;
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI ?? '', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    connection.isConnected = db.connections[0].readyState;

    // prevent adding multiple listeners
    mongoose.connection.getClient().setMaxListeners(0);

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    throw err;
  }
}

// Safe accessor if needed
export function getClient() {
  if (!mongoose.connection.getClient) {
    throw new Error("Mongo Client not initialized.");
  }
  return mongoose.connection.getClient();
}
