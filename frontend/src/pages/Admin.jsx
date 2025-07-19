import React, { useCallback, useEffect, useState } from "react";
import {useSocket} from '../context/Socket'
import { useNavigate } from "react-router-dom";
import './Home.css'
const Admin =()=>{

    const socket =useSocket();
    const [email,setEmail]=useState('');
    const [uname,setUname]=useState('');
    const [room,setRoom]=useState('');
    const isAdmin=true;
    const navigate =useNavigate();
    const handleRoomEntry=useCallback((e)=>{
      e.preventDefault();
      socket.emit("create-room",{email,uname,room,isAdmin});
      } ,[socket,uname,email,room]);
     
     
     
      const handleUserJoin =useCallback((data)=>{
        const {email,uname,room,isAdmin}=data;
        console.log('My email is',email,'username is',uname,'roomno is',room,'isadmin is',isAdmin);
        alert(`new room ${room} is created`);
        navigate(`/room/${room}`,{state:{isAdmin}});
       },[navigate]);


    useEffect(()=>{
         socket.on("create-room",handleUserJoin);
     
         return ()=>{
        socket.off("create-room",handleUserJoin);
     
  
         }
     },[socket,handleUserJoin])

  return(
    <div className="home-main">
        
       <div className="form-div">
        <h1>NITCMEET</h1>
        <form onSubmit={handleRoomEntry} className="form">
            <input value={uname} placeholder="Enter UserName" type="text" name="username" onChange={(e)=>{setUname(e.target.value)}}/>
            <input value={email} placeholder="Enter Email" type="email" name="email" onChange={(e)=>{setEmail(e.target.value)}}/>
            <input value={room} placeholder="Enter RoomCode" type="text" name="roomcode" onChange={(e)=>{setRoom(e.target.value)}}/>
            <button>Create</button>
        </form>
        </div>
    </div>
  );
}
export default Admin;