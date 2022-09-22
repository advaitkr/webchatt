const express = require('express')
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const twilio = require('twilio');
const PORT = process.env.PORT || 5002;
const app = express();
const server = http.createServer(app)
app.use(cors())
let connectedUsers = [];
let rooms = []
app.get('/api/room-exists/:roomId', (req, res) => {
   const { roomId } = req.params;
   const room = rooms.find((room) => room.id === roomId)
   if (room) {
      if (room.connectedUsers.length > 3) {
         return res.send({ roomExists: true, full: true })
      } else {
         return res.send({ roomExists: true, full: false })
      }
   }
   else {
      return res.send({ roomExists: false })
   }
})
const io = require('socket.io')(server, {
   cors: {
      origin: '*',
      methods: ['GET', 'POST']

   }
});
io.on('connection', (socket) => {
   console.log("connection done")
   console.log(`user connected ${socket.id}`)
   socket.on('create-new-room', (data) => {
      createNewRoomHandler(data, socket)
   })

   socket.on('join-room', (data) => {
      console.log("successful join room handler")
      joinRoomHandler(data, socket)
   })
   socket.on("disconnect", () => {
     
      disconnectHandler(socket)
   })
  socket.on("conn-signal",(data)=>{
   console.log("conn-signal")
     signalingHandler(data,socket)
  });

  socket.on("conn-init",(data)=>{
   console.log("conn-init")
  initializeConnectionHandler(data,socket)

  })

})
const createNewRoomHandler = (data, socket) => {
   console.log("host is creating new Room")
   console.log(data)
   const { identity } = data
   const roomId = uuidv4();
   const newUser = {
      identity,
      id: uuidv4(),
      socketId: socket.id,
      roomId
   }

   // push that user to connectedUsers

   connectedUsers = [...connectedUsers,newUser]
   const newRoom = {
      id: roomId,
      connectedUsers: [newUser]

   }
   socket.join(roomId)
   rooms = [...rooms,newRoom]
   socket.emit("room-id", { roomId })
   socket.emit('room-update', { connectedUsers: newRoom.connectedUsers })
}
const joinRoomHandler = (data, socket) => {

   const { identity, roomId } = data;
   const newUser = {
      identity,
      id: uuidv4(),
      socketId: socket.id,
      roomId

   }
   const room = rooms.find(room => room.id == roomId)
   room.connectedUsers = [...room.connectedUsers,newUser]
   socket.join(roomId)
   connectedUsers = [...connectedUsers,newUser]
   room.connectedUsers.forEach((user) => {
      if (user.socketId !== socket.id) {
        const data = {
          connUserSocketId: socket.id,
        };
  
        io.to(user.socketId).emit("conn-prepare", data);
      }
    });
   io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
}
const disconnectHandler = (socket) => {

   const user = connectedUsers.find((user) => user.socketId === socket.id)

   if (user) {
      const room = rooms.find(room => room.id === user.roomId)
      room.connectedUsers = room.connectedUsers.filter(user => user.socketId !== socket.id)

      socket.leave(user.roomId)

     if(room.connectedUsers.length > 0){
      
      io.to(room.id).emit("user-disconnected",{socketId:socket.id})
      

      io.to(room.id).emit("room-update",{
         connectedUsers:room.connectedUsers
      })
     }
     else{
         rooms = rooms.filter((r)=>r.id !== room.id)
     }
      
   
   }

}
const signalingHandler = (data,socket)=>{
  const { connUserSocketId, signal} = data;
  const signalingData = { signal, connUserSocketId: socket.id }
  io.to(connUserSocketId).emit("conn-signal",signalingData)
}
const initializeConnectionHandler = (data,socket)=>{
const {connUserSocketId} = data
const initData = {connUserSocketId:socket.id}
io.to(connUserSocketId).emit("conn-init",initData)
}

server.listen(PORT, () => {
   console.log(`Server is listening on ${PORT}`)
})