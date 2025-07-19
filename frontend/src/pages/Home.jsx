import React, { useCallback, useEffect, useState } from "react";
import {useSocket} from '../context/Socket'
import { useNavigate } from "react-router-dom";
import './Home.css'
const Home =()=>{
    const isAdmin =false;
    const socket =useSocket();
    const [email,setEmail]=useState('');
    const [uname,setUname]=useState('');
    const [room,setRoom]=useState('');
    const navigate =useNavigate();
    const handleRoomEntry=useCallback((e)=>{
      e.preventDefault();
      socket.emit("join-room",{email,uname,room});
      } ,[socket,uname,email,room]);
     
     
     
      const handleUserJoin =useCallback((data)=>{
        const {email,uname,room,AdminSocketID}=data;
        console.log('My email is',email,'username is',uname,'roomno is',room,'AdminSocketID is',AdminSocketID);
        navigate(`/room/${room}`,{state:{AdminSocketID}});
       },[navigate]);

     const handleInvalidEmail =() =>{
        alert('Another person already used this emailId')
     }
    useEffect(()=>{
         socket.on("join-room",handleUserJoin);
         socket.on("invalid-email",handleInvalidEmail);
         return ()=>{
        socket.off("join-room",handleUserJoin);
        socket.off("invalid-email",handleInvalidEmail);
  
         }
     },[socket,handleUserJoin,handleInvalidEmail])

  return(
    <div className="home-main">
        
       <div className="form-div">
        <h1>NITCMEET</h1>
        <form onSubmit={handleRoomEntry} className="form">
            <input value={uname} placeholder="Enter UserName" type="text" name="username" onChange={(e)=>{setUname(e.target.value)}}/>
            <input value={email} placeholder="Enter Email" type="email" name="email" onChange={(e)=>{setEmail(e.target.value)}}/>
            <input value={room} placeholder="Enter RoomCode" type="text" name="roomcode" onChange={(e)=>{setRoom(e.target.value)}}/>
            <button>Join</button>
        </form>
        </div>
    </div>
  );
}
export default Home;