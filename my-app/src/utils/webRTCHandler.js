import { setShowOverlay } from '../store/actions'
import store from '../store/store';
import * as wss from './wss';
import Peer from 'simple-peer'
let defaultConstraints = {
    audio:true,
    video:{
      width:"480",
      height:"360",
    },
}
let localStream
export const getLocalPreviewAndInitRoomConnection = async(
    isRoomHost,
    identity,
    roomId = null,
    onlyAudio
)=>{
    navigator.mediaDevices.getUserMedia(defaultConstraints).then((stream)=>{
        console.log('successfully received local stream')
        localStream = stream;
         showLocalVideoPreview(localStream)
         store.dispatch(setShowOverlay(false))
         isRoomHost? wss.createNewRoom(identity): wss.joinRoom(identity,roomId);
    })
    .catch((err)=>{
      console.log("error occured when trying to access the local stream")
      console.log(err)
    })
   
}


let peers = {}
let streams = []
const getConfiguration = ()=>{
  return {
    iceServers:[
     {

        urls:"stun:stun.l.google.com:19302"
     }


    ]


  }


}


export const prepareNewPeerConnection = (connUserSocketId,isInitiator)=>{
  const configuration = getConfiguration();
  peers[connUserSocketId] = new Peer({
      initiator:isInitiator,
      config:configuration,
      stream:localStream 
  })
peers[connUserSocketId].on('signal',(data)=>{
    const signalData = {
        signal: data,
        connUserSocketId:connUserSocketId
    };
    wss.signalPeerData(signalData)
})
 peers[connUserSocketId].on('stream',(stream)=>{
 console.log('new stream came')
 addStream(stream,connUserSocketId)
 streams = [...streams,stream]
 })

}
export const handleSignalingData = (data)=>{
    peers[data.connUserSocketId].signal(data.signal)
} 
export const removePeerConnection = (data)=>{
   const {socketId} = data;
   const videoContainer = document.getElementById(socketId);
   const videoEl = document.getElementById(`${socketId}-video`)

     if(videoContainer && videoEl){
      const tracks = videoEl.srcObject.getTracks();
      tracks.forEach(t=>tracks.stop());
      
        videoEl.srcObject = null;
        videoContainer.removeChild(videoEl)

        videoContainer.parentNode.removeChild(videoEl)
       if(peers[socketId]){
        peers[socketId].destroy()
       }
      delete peers[socketId] 
     }
}


const showLocalVideoPreview = (stream)=>{
    const videosContainer = document.getElementById("videos_portal");
    videosContainer.classList.add("videos_portal_styles");
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video_track_container");
    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.srcObject = stream;
  
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };
  
    videoContainer.appendChild(videoElement);
    videosContainer.appendChild(videoContainer);
  }
const addStream = (stream,connUserSocketId)=>{
  const videosContainer = document.getElementById("videos_portal");
  const videoContainer = document.createElement("div");
  videoContainer.id = connUserSocketId;
  videoContainer.classList.add("video_track_container");
  const videoElement = document.createElement("div");
  videoElement.autoplay = true;
  videoElement.srcObject = stream;
  videoElement.id = `${connUserSocketId}-video`;
  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };
  videoContainer.appendChild(videoElement);
  videosContainer.appendChild(videoContainer);
}