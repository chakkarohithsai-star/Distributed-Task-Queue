// importing socket.io client
import { io } from "socket.io-client";

// creating socket connection (uses environment variable for production)
const socket = io(
  import.meta.env.VITE_SOCKET_URL || "https://capstone-project-v867.onrender.com"
);

// exporting socket
export default socket;