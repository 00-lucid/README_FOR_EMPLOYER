const app = require("express")();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
const res = require("express/lib/response");
const { default: axios } = require("axios");
const io = require("socket.io")(server, {
  //socket 서버 cors 설정
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
require("dotenv").config();

// express 서버 cors 설정
app.use(cors());

// { name, creator, joiner }
let rooms = [];

// { room, list }
let reqs = [];

io.on("connection", (socket) => {
  console.log("connection info: " + socket.request.connection._peername);

  // 소캣이 룸이 존재하는지 체크하고 룸에 넣어준다
  socket.on("check", ({ nickname }) => {
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      if (room.creator === nickname || room.joiner === nickname) {
        socket.join(room.name);
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("join room", ({ from, room }) => {
    console.log(`${from} join ${room} room`);
    const elRoom = rooms.find((el) => el.name === room);

    elRoom.joiner = from;

    socket.join(room);

    io.to(room).emit("end");
    io.to(room).emit("notice", {
      message: `${elRoom.creator} 님이 채팅에 참가했습니다`,
    });
    io.to(room).emit("notice", {
      message: `${from} 님이 채팅에 참가했습니다`,
    });

    console.log(rooms);
  });

  // 실행조건:
  // - 다른 룸에 조인할 때
  // - 룸에서 나가기 버튼을 눌렀을 때
  socket.on("leave room", ({ from }) => {
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      let isIn = room.creator === from || room.joiner === from;

      if (isIn) {
        if (room.creator === from) {
          room.creator = null;
        } else {
          room.joiner = null;
        }
        if (!(room.creator && room.joiner)) {
          rooms = rooms.slice(0, i).concat(rooms.slice(i + 1));
        }
        socket.leave(room.name);
        io.to(room.name).emit("notice", {
          message: `${from} 님이 채팅에서 나가셨습니다`,
        });
        break;
      }
    }
  });

  socket.on("send message", ({ message, from }) => {
    const room = rooms.find((el) => {
      return el.joiner === from || el.creator === from;
    });
    console.log(`send message ${from} to ${room.name}`);
    io.to(room.name).emit("receiveMessage", { from, message });
  });

  socket.on("start", ({ from, room }) => {
    rooms.push({ name: room, creator: from, joiner: null });
    socket.join(room);
    socket.emit("loading", false);
  });

  socket.on("req permission", ({ from, fromUser, room }) => {
    const elReq = reqs.find((el) => el.room === room);

    if (!elReq) {
      reqs.push({ room: room, list: [fromUser] });
      io.to(room).emit("res permission", {
        username: fromUser,
        fromSocket: socket.id,
      });
    } else {
      if (!elReq.list.includes(fromUser)) {
        elReq.list.push(fromUser);
        io.to(room).emit("res permission", {
          username: fromUser,
          fromSocket: socket.id,
        });
      } else {
        return;
      }
    }

    console.log(reqs);
  });

  socket.on("req reject permission", ({ username, socketId }) => {
    for (let i = 0; i < reqs.length; i++) {
      let list = reqs[i].list;
      let idx = list.indexOf(username);
      if (idx !== -1) {
        reqs[i].list = list.slice(0, idx).concat(list.slice(idx + 1));
        break;
      }
    }

    io.to(socketId).emit("res reject permission", {});
  });

  socket.on("req accept permisson", ({ username, socketId }) => {
    for (let i = 0; i < reqs.length; i++) {
      const isIn = reqs[i].room === username;
      if (isIn) {
        reqs = reqs.slice(0, i).concat(reqs.slice(i + 1));
        break;
      }
    }

    io.to(socketId).emit("res accept permisson", { username });
  });
});

app.get("/", (req, res) => {
  res.send("duoduo live message server");
});
app.get("/live", async (req, res) => {
  try {
    if (req.headers.authorization) {
      let mode = "none";

      // 요청을 준 클라이언트가 room 또는 queue에 있다면 전달해줘야 함
      console.log(rooms);
      console.log(reqs);

      const jwt = req.headers.authorization;

      if (!jwt) {
        res.json({ state: "err" });
      }
      // {email, nickname, username}
      const { data } = await axios.get(`${process.env.SERVER_URL}/mypage`, {
        headers: {
          authorization: jwt,
        },
      });

      let findRoom = null;

      let findReq = null;

      let findPermissions = null;

      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.creator === data.nickname || room.joiner === data.nickname) {
          findRoom = room;
          break;
        }
      }

      for (let i = 0; i < reqs.length; i++) {
        const req = reqs[i];
        if (findRoom) {
          req.room === data.username ? (findPermissions = true) : null;
        }
        if (req.list.includes(data.username)) {
          findReq = req;
          break;
        }
      }

      console.log("findRoom: ", findRoom);
      console.log("findReq: ", findReq);

      if (findRoom) {
        // creator or joiner
        if (findRoom.creator === data.nickname) {
          if (findRoom.joiner) {
            mode = "end";
          } else {
            if (findPermissions) {
              mode = "permission";
            } else {
              mode = "waitCreator";
            }
          }
        } else {
          mode = "end";
        }
      } else if (findReq) {
        // wait joiner
        mode = "waitJoiner";
      }

      res.json({
        mode,
      });
    }
  } catch (err) {
    res.json({
      status: "err",
    });
  }
});

server.listen(5000, function () {
  console.log("서버 실행중 . . .");
});
