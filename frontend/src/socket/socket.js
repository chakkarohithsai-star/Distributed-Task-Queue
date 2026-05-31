// importing socket.io client
import { io } from "socket.io-client";

// creating socket connection
const socket = io(
  "http://localhost:5000"
);

// exporting socket
export default socket;