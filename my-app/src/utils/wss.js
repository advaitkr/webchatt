import io from "socket.io-client";
import * as webRTCHandler from "./webRTCHandler";
import { setRoomId, setParticipants, setSocketId } from "../store/actions";
import store from "../store/store";
const SERVER = 'http://localhost:5002'
let socket = null;
export const connectWithSocketIOServer = ()=>{
     socket = io(SERVER)
     console.log("socket:",socket)
    socket.on('connect',()=>{
        console.log('successfully connected with socket io server')
        console.log(socket.id)
        store.dispatch(setSocketId(socket.id))
    })
    socket.on('room-id',(data)=>{
    const {roomId} = data;
    store.dispatch(setRoomId(roomId))
    })

    socket.on("room-update",(data)=>{
        const { connectedUsers } = data;
        console.log(connectedUsers)
        store.dispatch(setParticipants(connectedUsers));
    })
   
  socket.on("conn-prepare",(data)=>{
   const { connUserSocketId } = data
   webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);
   socket.emit("conn-init", { connUserSocketId: connUserSocketId });

  })
  
  socket.on("conn-signal",(data)=>{
    webRTCHandler.handleSignalingData(data)
  })


    socket.on("conn-init", (data) => {
        const { connUserSocketId } = data;
        webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
      });

    socket.on("user-disconnected",(data)=>{
      webRTCHandler.removePeerConnection(data)
    })
}

export const createNewRoom = (identity,onlyAudio)=>{

    const data = {
        identity,
        onlyAudio
    };

    socket.emit('create-new-room',data)

}

export const joinRoom = (identity,roomId, onlyAudio) =>{
   const data = {
        roomId,
        identity,
        onlyAudio
   }
   socket.emit('join-room',data);
}
export const signalPeerData = (data)=>{
     socket.emit("conn-signal",data);
}