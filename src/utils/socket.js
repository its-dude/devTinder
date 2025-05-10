import { Server } from 'socket.io';
import jwt from "jsonwebtoken";

import { ChatModel } from '../models/chat.js';
import { ConnectionRequestModel } from '../models/connectionRequest.js';

export const intialiseSocket = (server) => {
  const io = new Server(server);
  io.use( async(socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      let toUserId     = socket.handshake.auth?.toUserId;
      toUserId = (!toUserId)?socket.handshake.headers?.touserid : toUserId;
      if(!toUserId){
        return next(new Error("Invalid connection!"));
      }
      const cookies = {};
      
      if (cookieHeader) {
        cookieHeader.split("; ").forEach(pair => {
          const [key, value] = pair.split("=");
          cookies[key] = value;
        });
      }

      const token = cookies._id;
      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      //check if both user are connected
      const connection = await ConnectionRequestModel.findOne({
        $or:[ {fromUserId:decoded.id  , toUserId:toUserId},
              {fromUserId:toUserId  , toUserId:decoded.id} ],
        status:"accepted",
      });
      if(!connection)return next(new Error("Invalid connection!"));
      // Optional: attach user info to socket for later use
      socket.userId = decoded.id;
      next(); //  allow connection
    } catch (error) {
      console.log(error.message)
      next(new Error("Authentication failed")); //  deny connection
    }
  });


  io.on("connection", socket => {

    //join user to their room
    socket.on("join", async ({ toUserId }) => {
      try {
        const userId = socket.userId;
        const roomId = [userId, toUserId].sort().join("_");
        //  console.log(userId + " joined to room "+roomId);
        socket.join(roomId);
      }
      catch (err) {
        console.log(err.message)//to be refine later
      }

    })

    socket.on("sendMessage", async ({ toUserId, text }) => {
      try {
      const userId = socket.userId;
      const roomId = [userId, toUserId].sort().join("_");
        let chat = await ChatModel.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new ChatModel({
            participants: [userId, toUserId],
            messages: [],
          })
        }

        chat.messages.push({ senderId: userId, text });
        io.to(roomId).emit("messageReceived", { toUserId, text });
        await chat.save();
      } catch (err) {
        console.log(err.message);
      }
    })


  })
} 
