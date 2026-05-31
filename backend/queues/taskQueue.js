// importing BullMQ queue
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

// creating queue named taskQueue
export const taskQueue = new Queue("taskQueue", {
  connection: redisConnection,
});