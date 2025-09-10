import app from "./app";
import { connectDB } from "./config/db";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
export const io = new SocketIOServer(server, { cors: { origin: "*" } });

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
