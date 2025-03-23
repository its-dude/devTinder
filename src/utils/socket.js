import {Server} from 'socket.io';

export const intialiseSocket = (server)=>{
    const io = new Server(server)
    io.on("connection",socket=>{
        //join user to their room
        socket.on("join",({userName,userId,toUserId})=>{
            const roomId= [userId,toUserId].sort().join("_");
            console.log(userName + " joined to room "+roomId);
            socket.join(roomId);
        })
        socket.on("sendMessage",({userName,userId,toUserId,text})=>{
            const roomId= [userId,toUserId].sort().join("_");
            console.log(userName + " sent  :"+text);
            io.to(roomId).emit("messageReceived",{userName,text})
        })
    })
} 
