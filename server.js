// server.js
import { createServer } from "http";
import next from "next";
import { initSocket } from "./server/socket.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    return handle(req, res);
  });

  // initialize socket.io on the same HTTP server
  initSocket(server);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Next + Socket.IO running at http://localhost:${port}`);
  });
});