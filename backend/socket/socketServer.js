// importing socket.io server
import { Server } from "socket.io";

// variable for global socket access
let io;

// map for storing active connected users/workers
const activeNodes = new Map();

/*
----------------------------------------------------
Helper Function
Broadcast all online workers to frontend
----------------------------------------------------
*/
export const broadcastPresence = () => {

  // safety check
  if (!io) return;

  // filtering only workers
  const onlineWorkers = Array
    .from(activeNodes.values())
    .filter(
      (node) => node.role === "worker"
    );

  // sending worker presence to frontend
  io.emit(
    "workers:presence",
    onlineWorkers
  );
};

/*
----------------------------------------------------
Initialize Socket Server
----------------------------------------------------
*/
export const initSocket = (server) => {

  // creating socket.io server
  io = new Server(server, {

    // enabling frontend connection
    cors: {

      // frontend url from env (allows both production Vercel and local development)
      origin: [process.env.CLIENT_URL, "https://distributedtaskqueue.vercel.app", "http://localhost:5173"].filter(Boolean),

      // allowed methods
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  /*
  ----------------------------------------------------
  When frontend connects
  ----------------------------------------------------
  */
  io.on("connection", (socket) => {

    console.log(
      "Client Connected:",
      socket.id
    );

    /*
    ----------------------------------------------------
    Register Worker / Client Presence
    ----------------------------------------------------
    */
    socket.on(
      "node:presence",
      (user) => {

        // validation
        if (user && user.userId) {

          // storing connected user
          activeNodes.set(
            socket.id,
            {
              socketId: socket.id,
              userId: user.userId,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          );

          console.log(
            `Registered ${user.role}: ${user.name}`
          );

          // broadcast updated workers list
          broadcastPresence();
        }
      }
    );

    /*
    ----------------------------------------------------
    Task Updates Event
    Worker or backend emits realtime task updates
    ----------------------------------------------------
    */
    socket.on(
      "task:update",
      (taskData) => {

        // broadcasting update to all clients
        io.emit(
          "task:updated",
          taskData
        );
      }
    );

    /*
    ----------------------------------------------------
    Disconnect Event
    ----------------------------------------------------
    */
    socket.on("disconnect", () => {

      // checking if socket exists
      if (activeNodes.has(socket.id)) {

        // getting node
        const node =
          activeNodes.get(socket.id);

        // removing node
        activeNodes.delete(socket.id);

        console.log(
          `Disconnected ${node.role}: ${node.name}`
        );

        // rebroadcast worker presence
        broadcastPresence();
      }

      console.log(
        "Client Disconnected:",
        socket.id
      );
    });
  });

  // returning io instance
  return io;
};

/*
----------------------------------------------------
Global IO Getter
Used by workers/controllers
----------------------------------------------------
*/
export const getIO = () => {

  // safety check
  if (!io) {

    throw new Error(
      "Socket.io not initialized"
    );
  }

  return io;
};
