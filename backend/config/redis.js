// importing ioredis
import Redis from "ioredis";

/*
------------------------------------------------
Creating Redis Connection
------------------------------------------------
Using Render Redis URL
------------------------------------------------
*/
export const redisConnection = new Redis(

  process.env.REDIS_URL,

  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

// Register error listener to prevent process crashes in deployed environments
redisConnection.on("error", (err) => {
  console.error("[Redis Connection] Error connecting to Redis server:", err.message);
});

/*
------------------------------------------------
Optional Default Export
------------------------------------------------
*/
export default redisConnection;
