const { Server } = require("socket.io");
const { MessageAck } = require("whatsapp-web.js");
const io = new Server(4000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdtoEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Usser Connected", socket.id);
  socket.on("room:join", ({ email, room }) => {
    console.log("Reuqest to join", { email: email, room });
    const data={email, room}
    socketIdtoEmailMap.set(socket.id, email);
    emailToSocketIdMap.set(email, socket.id);
    io.to(room).emit("user:joined",{email,id:socket.id})
    socket.join(room);
    io.to(socket.id).emit("room:join",data);
  });

  socket.on("user:call",({to,offer})=>{0
    console.log("Request come to make a call to",offer)
    io.to(to).emit("incomming:call",{from:socket.id,offer})
  })

  socket.on('call:accepted',({to,ans})=>{
    console.log("call Accepted",to,"AnSWER",ans)
    io.to(to).emit("call:accepted",{from:socket.id,ans});
  })


  socket.on("peer:nego:needed",({offer,to})=>{
    io.to(to).emit("peer:nego:needed",{from:socket.id,offer});
  })


  socket.on("peer:nego:done",({to,ans})=>{
    io.to(to).emit("peer:nego:final",{from:socket.id,ans})
  })
});
