import Redis from "ioredis";

// creating redis connection
const redis = new Redis(
  process.env.REDIS_URL,
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

export default redis;
