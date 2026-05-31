import dotenv from "dotenv";
import http from "http";
import Redis from "ioredis";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket, getIO } from "./socket/socketServer.js";

dotenv.config();

// connecting mongodb database
connectDB();

// wrapping app in http server
const server = http.createServer(app);

// initializing socket.io
initSocket(server);

// Redis subscriber setup
const redisSubscriber = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisSubscriber.subscribe("telemetry-updates", (err, count) => {
  if (err) {
    console.error("[Redis Pub/Sub] Subscription failed:", err.message);
  } else {
    console.log(`[Redis Pub/Sub] Subscribed to telemetry-updates channel (${count} channel active)`);
  }
});

redisSubscriber.on("message", (channel, message) => {
  if (channel === "telemetry-updates") {
    try {
      const payload = JSON.parse(message);
      
      // Broadcast to all Socket.io clients
      const io = getIO();
      io.emit("task:updated", payload);
    } catch (err) {
      console.error("[Redis Pub/Sub] Error parsing message:", err);
    }
  }
});

// starting backend server
server.listen(process.env.PORT, () => {
  console.log(`Server Running On ${process.env.PORT}`);
});