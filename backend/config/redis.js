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

/*
------------------------------------------------
Optional Default Export
------------------------------------------------
*/
export default redisConnection;
