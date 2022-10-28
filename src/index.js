const dotenv = require("dotenv");
dotenv.config();
const { Server } = require("socket.io");
const port = process.env.APP_PORT || 6969;

const io = new Server({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("new-client", (data) => {
    socket.data = data;
    socket.join("clients");
    io.to("managers").emit("newClient", data);
  });

  socket.on("new-manager", async (data, callback) => {
    socket.join("managers");
    const sockets = await io.in("clients").fetchSockets();
    const clients = sockets.map((socket) => socket.data);
    callback(clients);
  });

  socket.on("disconnect", () => {
    io.to("managers").emit("removeClient", socket.data);
  });

  socket.on("open-window", (client) => {
    io.to("clients").emit("open-window");
  });

  socket.on("close-window", (client) => {
    io.to("clients").emit("close-window");
  });

});

io.listen(port);
