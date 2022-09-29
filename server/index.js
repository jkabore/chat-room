const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");


const corsOptions = {
  origin: "http://localhost:3000/",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(authRoutes);

const { createServer } = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Room = require("./models/Rooms");
const { addUsers, getUser, removeUser } = require("./helper");

const Message = require("./models/Message");
app.get("/set-cookies", (req, res) => {
  res.cookie("username", "Tony");
  res.cookie("isAuthenticated", true, { maxAge: 24 * 60 * 60 * 1000 });
  res.send("cookies are set");
});
app.get("/get-cookies", (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  res.json(cookies);
});

const httpServer = createServer(app);
const io = require("socket.io")(httpServer);

const Port = process.env.Port || 5000;

const mongoDB =
  "mongodb+srv://jkabore1:comptedeDieu1@cluster0.lppsu3o.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  Room.find().then((result) => {
    socket.emit("output-rooms", result);
  });
  socket.on("create-room", (name) => {
    const room = new Room({ name });
    room.save().then((result) => {
      io.emit("create-room", result);
    });
  });

  socket.on("join", ({ name, room_id, user_id }) => {
    socket.join(room_id);
    const { error, user } = addUsers({
      socket_id: socket.id,
      name,
      room_id,
      user_id,
    });
    if (error) {
      console.log(error);
    } else {
      console.log(user);
    }
  });
  socket.on("sendMessage", (message, room_id, callback) => {
    const user = getUser(socket.id);
    const msgToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text: message,
    };
    const msg = new Message(msgToStore);
    msg.save().then((result) => {
      io.to(room_id).emit("message", msgToStore);
      callback();
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
    });
  });
});

httpServer.listen(Port, () => console.log("listening to port", Port));
