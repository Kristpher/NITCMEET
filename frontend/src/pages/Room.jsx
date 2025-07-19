import React, { useEffect, useState,useCallback ,useRef} from "react"
import { useSocket } from "../context/Socket";
import ReactPlayer from "react-player"
import peer from "../services/peer";
import { useLocation } from "react-router-dom";
import './Room.css'
import camon from "../assets/camera.png"
import camoff from "../assets/camera-off.png"
import chat from "../assets/chat.png"
import muted from "../assets/mute.jpg"
import unmute from "../assets/mute.webp"
import no_share from "../assets/close-sharing.jpg"
import share from "../assets/up-arrow.png"
import wb from "../assets/whiteboard.jpg"
import cut from "../assets/call-cut.jpg"
import { useNavigate } from "react-router-dom";

const Room = () => {
  const socket = useSocket();
  const Navigate=useNavigate();
  const [socketTrackId,setsocketTrackId]=useState(null)
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream,setRemoteStream]=useState(null);
  const [myscreen,setMyScreen]=useState(null);
  const [remotescreen,setRemoteScreen]=useState(null);
  const location = useLocation();
  const isAdmin = location.state?.isAdmin||false;
  const AdminSocketID =location.state?.AdminSocketID||false;
  const [msg, setMsg] = useState([{ chat: "", time: "", type: "" }]);
  const [text,setText]=useState("");
  const [mute,setMute]=useState(false);
  const [play,setPlay]=useState(true);
  const [remotemute,setRemoteMute]=useState(false);
  const [remoteplay,setRemotePlay]=useState(true);
  const [remoteStreamsAudio,setRemoteStreamAudio]=useState(null);
  const [remoteScreenAudio,setRemoteScreenAudio]=useState(null);
  const handleMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return stream;
  };

  const handleNewUser = useCallback(async ({ email, uname, id }) => {
    console.log("new user joined with email", email);
    setRemoteSocketId(id);
    setsocketTrackId(id);
     console.log("offer",remoteSocketId,'-',socketTrackId,'-',id)
   setTimeout(async () => {

  const offer = await peer.getOffer();
    
  socket.emit("call-user", { to: id, offer });
}, 500);
  }, [socket]);

  const handleIsAdmin = useCallback(async () => {
    console.log("almost reached there");
      const stream = await handleMedia();
      setMyStream(stream);
      console.log("reached there");
    
  }, []);

const handleAllowUser = useCallback(({ email, uname, socketId ,room}) => {
  const confirmed = window.confirm(`${uname} (${email}) wants to join. Allow?`);

  if (confirmed) {
    socket.emit("user-allowed", { socketId, email, uname, room});
   setsocketTrackId(socketId);
   console.log("confirmed",socketTrackId,'-',socketId)
  } else {
    socket.emit("user-denied", { socketId });
  }
},[socket]);

const handleIncomingCall =useCallback(async({from,offer})=>{
  console.log("AdminSocketID is",AdminSocketID);
   setsocketTrackId(from);
   //setRemoteSocketId(from);
  const stream = await handleMedia();
  setMyStream(stream);  
  const ans = await peer.getAnswer(offer);
     console.log("completed till generation of answr")
  socket.emit("call-accepted",{to:from,ans});
},[socket])


  const sendStreams = useCallback((from) => {
    
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
      // When you add a camera track
     
      {socket.emit("track-meta", { streamId: myStream.id,
        trackId: track.id,
        kind: "camera",to:from,type:track.kind});}

      console.log(remoteSocketId)


      console.log("Tracks I'm sending:", myStream.getTracks());
      console.log(`Sending camera track: ${track.id}, Stream: ${myStream.id}`);
    }
  
    

    
  }, [myStream,socket]);


const handleCallComplete =useCallback(async({from,ans}) =>{
   await peer.setLocalDescription(ans);
   console.log("completed till call accept now sharing remains")
   sendStreams(from);
   socket.emit("send-stream",{from})
  },[sendStreams,socket])

const handleSendStreamJoin =useCallback(({from})=>{
 sendStreams(from);
 console.log(from,'here');
},[sendStreams])
  


  const  handleNegoNeeded =useCallback(async()=>{
    
    console.log("negotiation started i guess");
    
  try {
    const offer = await peer.getOffer();
    socket.emit("new-nego-require", { to: remoteSocketId, offer });
  } catch (err) {
    console.error("Failed to create or send offer:", err);
  }
 
    
  },[remoteSocketId,socket]);

  useEffect (()=>{
   peer.peer.addEventListener("negotiationneeded",handleNegoNeeded);
   return()=>{
     peer.peer.removeEventListener("negotiationneeded",handleNegoNeeded);
   }
  },[handleNegoNeeded]);


  const handleNegoAnsCreate =useCallback(async({from,offer})=>{
    const ans = await peer.getAnswer(offer);
    socket.emit("ans-created",{to:from,ans})
  },[socket]);

  const handleFinalResponse =useCallback(async({from,ans})=>{
if (peer.peer.signalingState !== "stable") {
  await peer.setLocalDescription(ans);
} else {
  console.warn("Skipping setRemoteDescription: already in stable state");
}
  },[])

const trackMetadataQueueRef = useRef([]);
useEffect(() => {
  const handleTrackMeta = (data) => {
        console.log("teack reached the other socket",data.trackId);
    trackMetadataQueueRef.current.push({kind:data.kind,type:data.type});
  };

  const handleTrack = (event) => {
    const track = event.track;
       console.log("reached handle track",track);
    const meta = trackMetadataQueueRef.current.shift() || "unknown";
const mediaStream = new MediaStream([track]);
    if (meta.kind === "screen") {
      if(meta.type==="audio"){
        setRemoteScreenAudio(mediaStream);
        console.log("Audio track set screen:", track.id);
      
      }
      else{
      setRemoteScreen(mediaStream);
      }
     
    } else if (meta.kind === "camera") {
      if(meta.type==="audio"){
        setRemoteStreamAudio(mediaStream);
        console.log("Audio track set screen:", track.id);
              console.log("Camera audio stream assigned:", {
            trackId: track.id,
            mediaStreamTracks: mediaStream.getTracks().map(t => ({
              id: t.id,
              kind: t.kind,
              enabled: t.enabled,
              readyState: t.readyState,
            })),
          });
      }
      
      else{
      setRemoteStream(mediaStream);
      console.log("reached-camera")
      }
    } else {
      console.warn("Unknown track kind");
    }
  };

  socket.on("track-meta-act", handleTrackMeta);
   console.log("going to ontrack");
  peer.peer.ontrack = handleTrack;
  console.log("completed tracks");
  return () => {
    socket.off("track-meta-act", handleTrackMeta);
  };
}, [socket, peer.peer]);

  useEffect(() => {
    socket.on("allow-user",handleAllowUser);
    socket.on("user-joined", handleNewUser);
    socket.on("incoming-call",handleIncomingCall);
    socket.on("call-complete",handleCallComplete);
    socket.on("start-stream",handleSendStreamJoin);
    socket.on("create-ans",handleNegoAnsCreate);
    socket.on("sent-ans",handleFinalResponse);

    return () => {
      socket.off("allow-user",handleAllowUser);
      socket.off("user-joined", handleNewUser);
      socket.off("incoming-call",handleIncomingCall);
      socket.off("call-complete",handleCallComplete);
      socket.off("start-stream",handleSendStreamJoin);
      socket.off("create-ans",handleNegoAnsCreate);
      socket.off("sent-ans",handleFinalResponse);
    };
  }, [socket, handleNewUser,handleAllowUser,handleIncomingCall,handleCallComplete,handleSendStreamJoin,handleNegoAnsCreate,handleFinalResponse]);


  useEffect(() => {
    console.log("entered use effect",isAdmin)
    if (isAdmin) {
          console.log("entered admin")
      handleIsAdmin();
    }
  }, [isAdmin,handleIsAdmin]);

useEffect(() => {
  if (peer.peer) {
    const pc = peer.peer;
    const onIceChange = () => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
    };
    pc.addEventListener("iceconnectionstatechange", onIceChange);

    return () => {
      pc.removeEventListener("iceconnectionstatechange", onIceChange);
    };
  }
}, []);


useEffect(() => {
  peer.peer.onicecandidate = (event) => {
    if (event.candidate && socketTrackId) {
      console.log("Emitting ICE candidate");
      socket.emit("ice-candidate", {
        to: socketTrackId,
        candidate: event.candidate,
      });
    }
  };
  socket.on("ice-candidate", async ({ candidate }) => {
    console.log("Received ICE candidate:", candidate);
    await peer.addIceCandidate(candidate);
  });
return () => {
    socket.off("ice-candidate");
  };
}, [remoteSocketId, socket]);
  
const handleScreenShare =async ()=>{
   const screenStream =await navigator.mediaDevices.getDisplayMedia({
    video:true,
    audio:true
   })
   if(!isAdmin){   setRemoteSocketId(AdminSocketID);}
   setMyScreen(screenStream)

  
}

useEffect(() => {
  if (myscreen) {
    // socket.emit("trigger-negotiation", { to: socketTrackId });
    console.log("myscreen is now available");

    for (const track of myscreen.getTracks()) {
      peer.peer.addTrack(track, myscreen);
      console.log("Emitting track-meta for screen:", {
  streamId: myscreen.id,
  trackId: track.id,
  kind: "screen",

});
    
  socket.emit("track-meta", {
    streamId: myscreen.id,
    trackId: track.id,
    kind: "screen",
    to:socketTrackId,
    type:track.kind
  });
  
 // Simulate 2-second delay
      console.log(`Sending screen track: ${track.id}, Stream: ${myscreen.id},SocketId:${socketTrackId},type:${track.kind}`);
    }
  }
}, [myscreen,socket]);


const handleEndSharing =async()=>{
 
    if (myscreen) {
    // Stop all media tracks (screen video/audio)
    myscreen.getTracks().forEach(track => track.stop());

    // Optionally, remove those tracks from the peer connection
    myscreen.getTracks().forEach(track => {
      peer.peer.removeTrack(peer.peer.getSenders().find(sender => sender.track === track));
    });
    socket.emit("stopped-tracks",{to:socketTrackId});
     setMyScreen(null)
  }
}

const handleTextEdit=(e)=>{
  setText(e.target.value);

}
const handleSentChat =({})=>{
  if(text!=""){
  const time = new Date().toLocaleTimeString();
  setMsg(prev => [...prev, { chat: text, time: time, type: "sent" }]);
  setText("");
  socket.emit("sent-text",{to:socketTrackId,text});
  }
}

const handleArrivedChat =({from,txt})=>{
  const time = new Date().toLocaleTimeString();
  setMsg(prev => [...prev, { chat: txt, time: time, type: "recieved" }]);
  console.log("recieved",txt)
  
}
const handleTracksLost =({from})=>{
  if(remotescreen){
    setRemoteScreen(null);
  }
}

const handleRemoteMute =({from,rm})=>{
  setRemoteMute(rm);
}

const handleRemotePlay=({from,rp})=>{
   setRemotePlay(rp);
}

// const closeConnection =()=>{
//       if (peer.peer) {
//     peer.peer.close();
//     peer.peer=null;
    
//     console.log("Peer connection closed");
//   }
// }
const stopMediaTracks = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

const handleCallend =()=>{
  
  socket.emit("call-ended",{to:socketTrackId});
 
  socket.emit("loss-data",{to:socketTrackId});
   stopMediaTracks(myStream);
  stopMediaTracks(myscreen);
   Navigate("/callended")
  // closeConnection();
  // socket.emit("close connection",{to:socketTrackId}); 
}

useEffect(()=>{
  socket.on("recieved-data",handleArrivedChat);
  socket.on("tracks-lost",handleTracksLost);
  socket.on("toggle-mute",handleRemoteMute);
  socket.on("toggle-play",handleRemotePlay);
  socket.on("call-over",handleCallend);
  //socket.on("close",closeConnection);
  return()=>{
    socket.off("recieved-data",handleArrivedChat);
    socket.off("tracks-lost",handleTracksLost);
    socket.off("toggle-mute",handleRemoteMute);
    socket.off("toggle-play",handleRemotePlay);
    socket.on("call-over",handleCallend);
    //socket.off("close",closeConnection);
  }
},[socket,handleArrivedChat,handleTracksLost,handleCallend,handleRemoteMute,handleRemotePlay]);


  const [mainStream, setMainStream] = useState("my"); // "my", "remote", "screen"
  const [showChat, setShowChat] = useState(false);

useEffect(() => {
  if (mainStream === "screen" && !myscreen) {
    if (remoteStream) setMainStream("remote");
    else if (remotescreen) setMainStream("rscreen");
    else if (myStream) setMainStream("my");
  } else if (mainStream === "rscreen" && !remotescreen) {
    if (remoteStream) setMainStream("remote");
    else if (myscreen) setMainStream("screen");
    else if (myStream) setMainStream("my");
  } else if (mainStream === "remote" && !remoteStream) {
    if (remotescreen) setMainStream("rscreen");
    else if (myscreen) setMainStream("screen");
    else if (myStream) setMainStream("my");
  } else if (mainStream === "my" && !myStream) {
    if (remoteStream) setMainStream("remote");
    else if (remotescreen) setMainStream("rscreen");
    else if (myscreen) setMainStream("screen");
  }
}, [mainStream, myStream, remoteStream, myscreen, remotescreen]);

const handleMute=()=>{
  const m=!mute;
  socket.emit("mute-change",({rm:m,to:socketTrackId}));
  setMute(!mute);
}
const handlePlay=()=>{
  const p=!play;
  socket.emit("play-change",({rp:p,to:socketTrackId}));
  setPlay(!play);
}

const remoteScreenAudioRef = useRef(null);
const remoteStreamAudioRef = useRef(null);

useEffect(() => {
  if (remoteScreenAudioRef.current && remoteScreenAudio) {
    remoteScreenAudioRef.current.srcObject = remoteScreenAudio;

  }
}, [remoteScreenAudio]);

useEffect(() => {
  if (remoteStreamAudioRef.current && remoteStreamsAudio) {
    remoteStreamAudioRef.current.srcObject = remoteStreamsAudio;
        console.log("audio  stream is successful");
  }
}, [remoteStreamsAudio]);




   return (
    <div className="main-room"> 
    <div className="main-video-display">
  {mainStream === "my" && myStream && (<>
    <ReactPlayer url={myStream} playing={play}  muted className="main-video" />
  
    </>
  )}
  {mainStream === "remote" && remoteStream && (<>
    <ReactPlayer url={remoteStream}  playing={remoteplay}  className="main-video" />

    
</>
  )}
  {mainStream === "screen" && myscreen && (
    <ReactPlayer url={myscreen} playing={play} muted className="main-video" />
  )}
  {mainStream === "rscreen" && remotescreen && (<>
    <ReactPlayer url={remotescreen} playing  className="main-video" />

</>
  )}
</div>
<div className="sub-room">
  {myStream && mainStream !== "my" && (
    <>
      <h4>My stream</h4>
      <ReactPlayer
        url={myStream}
        playing={play}
        muted
        height="100px"
        width="150px"
        onClick={() => setMainStream("my")}
        className="mini-video"
      />
    </>
  )}

  {remoteStream && mainStream !== "remote" && (
    <>
      <h4>Remote Stream</h4>
      <ReactPlayer
        url={remoteStream}
        playing={remoteplay}
       
        height="100px"
        width="150px"
        onClick={() => setMainStream("remote")}
        className="mini-video"
      />
  
    
    </>
  )}
{remoteStreamsAudio && (
  <audio
    ref={remoteStreamAudioRef}
    muted={remotemute}
    autoPlay
    playsInline
    controls
     style={{ display: "none" }}
  />
)}
  {myscreen && mainStream !== "screen" && (
    <>
      <h4>My Screen</h4>
      <ReactPlayer
        url={myscreen}
        playing
        muted
        height="100px"
        width="150px"
        onClick={() => setMainStream("screen")}
        className="mini-video"
      />
    </>
  )}
  {remotescreen && mainStream !== "rscreen" && (
    <>
  <ReactPlayer
    url={remotescreen}
    playing

    height="100px"
    width="150px"
    onClick={() => setMainStream("rscreen")}
    className="mini-video"
  />
     

  </>
)}{remoteScreenAudio
   && (
  <audio
    ref={remoteStreamAudioRef}
    muted={remotemute}
    autoPlay
    playsInline
    controls
     style={{ display: "none" }}
  />
)}

</div>
      <div className="room-buttons">
        <button onClick={handleMute}>{!mute?<img src={muted} />:<img src={unmute} />}</button>
        <button onClick={handlePlay}>{play?<img src={camon} />:<img src={camoff} />}</button>
        <button onClick={() => setShowChat(!showChat)}><img src={chat} /></button>
       {myscreen ? (
          <button onClick={handleEndSharing}><img src={no_share} /></button>
        ) : (
          <button
            onClick={() => {
              if (remotescreen != null) {
                alert("Ask the other person to turn off screen sharing");
              } else {
                handleScreenShare();
              }
            }}
          >
            <img src={share} />
          </button>
        )}
     <button onClick={handleCallend}><img src={cut} /></button>
      </div>
      {showChat && (
        <div className="Chat-room">
          <h4>chat here</h4>
          <div className="Chat-messages">
            <ul>
              {msg.map((Item, index) => (
                <li key={index}>
                  {Item.type === "recieved" ? (
                    <div className="left"><p>{Item.chat}</p></div>
                  ) : (
                    <div className="right"><p>{Item.chat}</p></div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="Sent-div">
            <input
              onChange={handleTextEdit}
              className="sent-chat"
              placeholder="Sent message"
              value={text}
            />
            <button onClick={handleSentChat}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
   
    
  

