const express = require("express");
const { Server } = require("socket.io");
//const http = require("http");
const fs = require('fs');
const https = require('https');
const app = express();
const server = https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}, app);

// const io = new Server(server, {
//   cors: true
// });


const io = new Server(server, {
  cors: {
    origin: "https://973f-103-151-189-159.ngrok-free.app", 

    methods: ["GET", "POST"],
    credentials: true,
  },
});
// app.get("/", (req, res) => {
//   res.send("NITCMeet Secure Server Running");
// });

const path = require("path");

// Serve frontend build

app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  next();
});

app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
    console.log("Serving React index.html");
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

let myEmail="";

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
let AdminSocketID = null;

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("create-room", (data) => {
    const { email, uname, room, isAdmin } = data;
    myEmail=email;
    console.log("Room created:", email, uname, room, isAdmin);
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    if (isAdmin) {
      AdminSocketID = socket.id;
    }

    socket.join(room);
    io.to(socket.id).emit("create-room", data);
  });

  socket.on("join-room", (data) => {
    const { email, uname, room } = data;
    myEmail=email;
    if (!emailToSocketIdMap.has(email)) {
      console.log("Join request from:", email, uname, room);
      emailToSocketIdMap.set(email, socket.id);
      socketidToEmailMap.set(socket.id, email);

      // Ask admin for permission
      io.to(AdminSocketID).emit("allow-user", {
        email,
        uname,
        socketId: socket.id,
        room,
      });
    } else {
      socket.emit("invalid-email");
    }
  });

  socket.on("user-allowed", ({ socketId, email, uname, room }) => {
    console.log(`User allowed: ${email} + ${room}`);
    io.to(socketId).emit("join-room", { email, uname, room,AdminSocketID });
    io.to(room).emit("user-joined", { email, uname, id: socketId });

    const userSocket = io.sockets.sockets.get(socketId);
    if (userSocket) {
      userSocket.join(room);
    }
  });

  socket.on("user-denied", ({ socketId }) => {
    console.log(`User denied: ${socketId}`);
    io.to(socketId).emit("join-denied", {
      reason: "Admin denied your request to join the room.",
    });


    const email = socketidToEmailMap.get(socketId);
    if (email) emailToSocketIdMap.delete(email);
    socketidToEmailMap.delete(socketId);
  });


  socket.on("call-user",({to,offer})=>{
    io.to(to).emit("incoming-call",{from:socket.id,offer});
    console.log("reached call user");
  });

  socket.on("call-accepted",({to,ans})=>{
     console.log("reached call accepted");
    io.to(to).emit("call-complete",{from:socket.id,ans})
  })

  socket.on("send-stream",({from})=>{
      console.log("ready to send stream");
      io.to(from).emit("start-stream",{from:socket.id})
  })

  socket.on("new-nego-require",({to,offer})=>{
    io.to(to).emit("create-ans",{from:socket.id,offer});
    console.log("reached create ans",to);
  })
  socket.on("ans-created",({to,ans})=>{
    io.to(to).emit("sent-ans",({from:socket.id,ans}));
    console.log("reaced ans created");
  })


  socket.on("ice-candidate", ({ to, candidate }) => {
  io.to(to).emit("ice-candidate", { candidate }); 
});

socket.on("track-meta",({streamId, trackId, kind,to,type})=>{
  io.to(to).emit("track-meta-act",{streamId,trackId,kind,type});
  console.log("yaaay,you have reached track meta and socket is,",to);
})


socket.on("sent-text",({to,text})=>{
  io.to(to).emit("recieved-data",{from:socket.id,txt:text});
  console.log("senting-data",text,"to",to);
})

socket.on("stopped-tracks",({to})=>{
 io.to(to).emit("tracks-lost",{from:socket.id})});
socket.on("mute-change",({rm,to})=>{
  io.to(to).emit("toggle-mute",{from:socket.id,rm});
})

socket.on("play-change",({rp,to})=>{
  io.to(to).emit("toggle-play",{from:socket.id,rp});
})

socket.on("call-ended",({to})=>{
   io.to(to).emit("call-over",{});
});
//  socket.on("trigger-negotiation",({to})=>{
//    io.to(to).emit("nego-to-admin",{from:socket.id});
//    console.log("final emission")
//  })

 socket.on("loss-data", ({ to }) => {
  if (to !== socket.id) return; 

  const email = socketidToEmailMap.get(socket.id);
  console.log(`Disconnected (loss-data): ${socket.id} (email: ${email})`);

  if (email) {
    emailToSocketIdMap.delete(email);
  }
  socketidToEmailMap.delete(socket.id);
});


  socket.on("close connection",({to})=>{
    io.to(to).emit("close",{});
  })
  socket.on("disconnect", () => {
  const email = socketidToEmailMap.get(socket.id);
    console.log(`Disconnected: ${socket.id} (email: ${email}`);

    if (email) {
      emailToSocketIdMap.delete(email);
    }
    socketidToEmailMap.delete(socket.id);
  });


});

server.listen(8001, () => {
  console.log("Socket server running on port 8001");
});