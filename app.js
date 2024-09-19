const express=require("express");
const {Server}=require("socket.io")
const {createServer}=require("http");

const PORT=process.env.PORT||4000
const app=express();
const cors=require('cors')
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Replace '*' with your allowed domains in production
  methods: ['GET', 'POST','PUT','DELETE'],
  credentials: true,
}))
const server=createServer(app);
const io=new Server(server,{
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,  // Adjust pingTimeout to give more time
  pingInterval: 25000, 
});

app.get("/",(req,res)=>{
  console.log("SErver is working fine")
  res.send("SERVER IS WORKING FINE")
})


const emailToSocketIdMap = new Map();
const socketIdtoEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  
  socket.on("room:join", ({ email, room }) => {
    console.log("Request to join", { email: email, room });
    const data = { email, room };
    socketIdtoEmailMap.set(socket.id, email);
    emailToSocketIdMap.set(email, socket.id);
    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log("Request to make a call to", to, offer);
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

 

  socket.on('call:accepted', ({ to, ans }) => {
    console.log("Call accepted", to, "Answer", ans);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ offer, to }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    // Clean up maps or handle disconnections if necessary
  });
});


server.listen(PORT,()=>{
  console.log(`server is started on port ${PORT}`)
})
