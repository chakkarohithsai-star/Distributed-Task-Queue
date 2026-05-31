// importing BullMQ worker
import { Worker } from "bullmq";

// importing redis connection
import { redisConnection } from "../config/redis.js";
import Redis from "ioredis";

// importing task model
import Task from "../models/Task.js";

// mongoose for db connection
import mongoose from "mongoose";

// dotenv for env variables
import dotenv from "dotenv";

dotenv.config();

// connect mongodb
mongoose.connect(process.env.MONGO_URI);

// Redis publisher setup for workers running in separate threads
const redisPublisher = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// creating worker
const worker = new Worker(
  "taskQueue",

  // processing jobs
  async (job) => {

    console.log("Processing:", job.data.taskName);

    // update status to processing
    const taskProc = await Task.findByIdAndUpdate(
      job.data.taskId,
      {
        status: "processing",
      },
      { new: true }
    ).populate("assignedWorker", "name email");

    // publish processing telemetry event to Redis Pub/Sub
    await redisPublisher.publish("telemetry-updates", JSON.stringify({
      taskId: taskProc._id,
      status: "processing",
      projectId: taskProc.projectId,
      assignedWorker: taskProc.assignedWorker
    }));

    // fake delay
    await new Promise((resolve) =>
      setTimeout(resolve, 5000)
    );

    // update completed
    const taskComp = await Task.findByIdAndUpdate(
      job.data.taskId,
      {
        status: "completed",
      },
      { new: true }
    ).populate("assignedWorker", "name email");

    // publish completed telemetry event to Redis Pub/Sub
    await redisPublisher.publish("telemetry-updates", JSON.stringify({
      taskId: taskComp._id,
      status: "completed",
      projectId: taskComp.projectId,
      assignedWorker: taskComp.assignedWorker
    }));

    console.log("Completed:", job.data.taskName);
  },

  {
    connection: redisConnection,
  }
);

// completed event
worker.on("completed", () => {
  console.log("Task Completed Successfully");
});