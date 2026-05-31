// importing environment variables
import dotenv from "dotenv";

// importing node http server
import http from "http";

// importing redis client
import Redis from "ioredis";

// importing express app
import app from "./app.js";

// importing mongodb connection
import { connectDB } from "./config/db.js";

// importing socket setup
import {
  initSocket,
  getIO,
} from "./socket/socketServer.js";

// loading .env variables
dotenv.config();

/*
------------------------------------------------
Connect MongoDB Database
------------------------------------------------
*/
connectDB();

/*
------------------------------------------------
Creating HTTP Server
Socket.io requires raw http server
------------------------------------------------
*/
const server = http.createServer(app);

/*
------------------------------------------------
Initialize Socket.io
------------------------------------------------
*/
initSocket(server);

/*
------------------------------------------------
Redis Subscriber
Listening realtime task events
------------------------------------------------
*/
const redisSubscriber = new Redis(

  process.env.REDIS_URL,

  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

// Register error listener to prevent process crashes in deployed environments
redisSubscriber.on("error", (err) => {
  console.error("[Redis Subscriber] Error connecting to Redis server:", err.message);
});

/*
------------------------------------------------
Subscribing telemetry channel
------------------------------------------------
*/
redisSubscriber.subscribe(
  "telemetry-updates",

  (err, count) => {

    if (err) {

      console.error(
        "[Redis Pub/Sub] Subscription failed:",
        err.message
      );

    } else {

      console.log(
        `[Redis Pub/Sub] Subscribed to telemetry-updates (${count})`
      );
    }
  }
);

/*
------------------------------------------------
Realtime Redis Events
------------------------------------------------
*/
redisSubscriber.on(
  "message",

  (channel, message) => {

    if (channel === "telemetry-updates") {

      try {

        // parsing redis message
        const payload =
          JSON.parse(message);

        // getting socket instance
        const io = getIO();

        // broadcasting realtime update
        io.emit(
          "task:updated",
          payload
        );

      } catch (err) {

        console.error(
          "[Redis Pub/Sub] Parse Error:",
          err
        );
      }
    }
  }
);

/*
------------------------------------------------
Health Route
------------------------------------------------
*/
app.get("/", (req, res) => {

  res.send(
    "AetherQueue Backend Running"
  );
});

/*
------------------------------------------------
Starting Backend Server
------------------------------------------------
*/
server.listen(

  process.env.PORT || 5000,

  () => {

    console.log(
      `Server Running On Port ${process.env.PORT}`
    );
  }
);
