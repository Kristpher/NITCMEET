import React, { createContext, useContext, useMemo } from "react";
import {io} from "socket.io-client"
const SocketContext = createContext(null);

export const useSocket =()=>{
    const socket = useContext(SocketContext);
    return socket;
};

export const SocketProvider =(props)=>{
  const socket = useMemo(() => {
    return io("https://973f-103-151-189-159.ngrok-free.app", {
      secure: true,
      rejectUnauthorized: false,
    });
  }, [])
    return(
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
};