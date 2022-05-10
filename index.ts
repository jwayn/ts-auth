import http from "http";
import app from "./src/app";
import { AddressInfo } from "net";
require("dotenv").config();

function normalizePort(val: string) {
  const port = parseInt(val, 10);
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

const port: number =
  (process.env.PORT && normalizePort(process.env.PORT)) || 8888;

const server = http.createServer(app);
server.listen(port);
server.on("listening", onListening);

function onListening() {
  const addr: string | AddressInfo | null = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  console.debug("Listening on " + bind);
}
