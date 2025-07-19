import React from "react";
import { useNavigate } from "react-router-dom";
import './First.css'
const First = ()=>{
      const navigate =useNavigate();
      const  handleJoinMeeting =()=>{
        navigate(`/join`)
      }
      const handleNewMeeting =()=>{
        navigate(`/create`)
      }
    return(
        <div className="First-div">
            <h1>NITCMEET</h1>
            <button onClick={handleNewMeeting}>Create New Meeting</button>
            <button onClick={handleJoinMeeting}>Join a Meeting</button>
        </div>
    )
}
export default First;