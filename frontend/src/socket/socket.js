// importing socket.io client
import { io } from "socket.io-client";

// creating socket connection (uses environment variable for production)
const socket = io(
  import.meta.env.VITE_SOCKET_URL || "https://distributed-task-queue-kn7y.onrender.com"
);

// exporting socket
export default socket;