// importing socket.io server
import { Server } from "socket.io";

// variable for io access globally
let io;

// Map to track active connected nodes (socket.id -> { userId, name, email, role })
const activeNodes = new Map();

// Helper to broadcast active workers list to all clients
export const broadcastPresence = () => {
  if (!io) return;
  const onlineWorkers = Array.from(activeNodes.values())
    .filter((node) => node.role === "worker");
  io.emit("workers:presence", onlineWorkers);
};

// function to initialize socket server
export const initSocket = (server) => {

  // creating socket.io server
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  // when frontend connects
  io.on("connection", (socket) => {
    console.log("Client Connected:", socket.id);

    // Register node presence (worker or client)
    socket.on("node:presence", (user) => {
      if (user && user.userId) {
        activeNodes.set(socket.id, {
          socketId: socket.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        });
        console.log(`Registered presence for ${user.role}: ${user.name} (${socket.id})`);
        broadcastPresence();
      }
    });

    // when frontend disconnects
    socket.on("disconnect", () => {
      if (activeNodes.has(socket.id)) {
        const node = activeNodes.get(socket.id);
        activeNodes.delete(socket.id);
        console.log(`Unregistered presence for ${node.role}: ${node.name}`);
        broadcastPresence();
      }
      console.log("Client Disconnected:", socket.id);
    });
  });

  return io;
};

// export io for worker usage
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};