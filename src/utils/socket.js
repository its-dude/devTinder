import { Server } from 'socket.io';
import jwt from "jsonwebtoken";

import { ChatModel } from '../models/chat.js';
import { ConnectionRequestModel } from '../models/connectionRequest.js';
import { User } from '../models/user.js';
import connection, { disconnect } from 'mongoose';

const onlineUsers = new Map();

export const intialiseSocket = (server) => {
  const io = new Server(server);

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

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
      // Optional: attach user info to socket for later use
      const user = await User.findOne({ _id: decoded.id });
      const name = `${user.firstName} ${user.lastName}`
      socket.userId = decoded.id;
      socket.name = name;
      onlineUsers.set(decoded.id, socket.id);
      next(); //  allow connection
    } catch (error) {
      next(new Error("Authentication failed")); //  deny connection
    }
  });

  io.on("connection", async (socket) => {

    const userConnections = await ConnectionRequestModel.find({
      $or: [{ fromUserId: socket.userId }, { toUserId: socket.userId }],
      status: "accepted",
    });

    const friends = userConnections.map(userConnection => {
      if (userConnection.fromUserId.toString() == socket.userId) {
        return userConnection.toUserId.toString();
      } else {
        return userConnection.fromUserId.toString();
      }
    })

    friends.forEach(friend => {
      let friendsocketid = onlineUsers.get(friend);
      if (friendsocketid) {
        io.to(socket.id).emit("online", { userId: friend });
        io.to(friendsocketid).emit("online", { userId: socket.userId });
      }
    })
    //join user to their room
    socket.on("join", async ({ toUserId, groupChatId }) => {
      try {
        const userId = socket.userId;
        if (toUserId && !groupChatId) {
          const connection = await ConnectionRequestModel.findOne({
            $or: [{ fromUserId: userId, toUserId: toUserId },
            { fromUserId: toUserId, toUserId: userId }],
            status: "accepted",
          });
          if (!connection) return next(new Error("Invalid connection!"));
          const roomId = [userId, toUserId].sort().join("_");
          socket.join(roomId);

        }
        else if (groupChatId && !toUserId) {
          const groupChat = await ChatModel.findOne({
            participants: userId,
            isGroup: true,
          })
          if (!groupChat) return next(new Error("Sorry you are not a member of this group"));
          const groupRoomId = [groupChatId, process.env.GROUP_KEY].join("_");
          socket.join(groupRoomId);

        }
      }
      catch (err) {
        console.log(err.message)//to be refine later
      }
    })

    socket.on("sendMessage", async ({ toUserId, groupChatId, message }) => {
      try {
        const userId = socket.userId;
        const roomId = [userId, toUserId].sort().join("_");
        const groupRoomId = [groupChatId, process.env.GROUP_KEY].join("_");
        if (toUserId) {
          let chat = await ChatModel.findOne({
            participants: { $all: [userId, toUserId] },
            isGroup: false,
          });

          if (!chat) {
            chat = new ChatModel({
              participants: [userId, toUserId],
              messages: [],
            })
          }
          chat.messages.push({ senderId: userId, text: message });
          io.to(roomId).emit("messageReceived", { fromUserId: userId, name: socket.name, image: socket.image, message });
          await chat.save();
        } else {
          let chat = await ChatModel.findOne({
            _id: groupChatId,
            participants: userId,
            isGroup: true,
          })
          if (chat) {
            chat.messages.push({ senderId: userId, text: message });
            io.to(groupRoomId).emit("messageReceived", { fromUserId: userId, groupChatId, name: socket.name, message });
            await chat.save();
          }
        }


      } catch (err) {
        console.log(err.message);
      }
    })

    socket.on('call-user', to => {
      const otherUserSocketId = onlineUsers.get(to);
      if (otherUserSocketId) {
        socket.to(otherUserSocketId).emit('incoming-call',{from:socket.userId , name:socket.name});
      }else if(!otherUserSocketId){
        console.log("user is offline");
        socket.emit('callee-offline');
      }
    
    })

    socket.on('accept-call', data => {
      const { to } = data;
      const otherUserSocketId = onlineUsers.get(to);
      socket.to(otherUserSocketId).emit('call-accepted' ,{from:socket.userId });
    })
    socket.on('reject-call', data => {
      const { to } = data;
      const otherUserSocketId = onlineUsers.get(to);
      socket.to(otherUserSocketId).emit('callee-rejected-call');
    })

    socket.on('offer',data=>{
      const { to , offer } = data;
      const otherUserSocketId = onlineUsers.get(to);
      socket.to(otherUserSocketId).emit('offer' ,{from:socket.userId ,offer});
    })
    socket.on('answer',data=>{
      const { to , answer } = data;
      const otherUserSocketId = onlineUsers.get(to);
      socket.to(otherUserSocketId).emit('answer' ,{from:socket.userId ,answer});
    })
    socket.on('end-call',to=>{
      const otherUserSocketId = onlineUsers.get(to);
      socket.to(otherUserSocketId).emit('end-call')
    })
    socket.on('end-up-calling',to=>{
      console.log("end up ",to);
      const otherUserSocketId = onlineUsers.get(to);
      socket.to(otherUserSocketId).emit('end-up-calling')
    })
    socket.on('ice-candidate',data=>{
      const {candidate , to} = data;
      const userSocketId = onlineUsers.get(to);
      socket.to(userSocketId).emit('ice-candidate',candidate)
    })

    socket.on("disconnect", async () => {
      friends.forEach(friend => {
        let friendsocketid = onlineUsers.get(friend._id);
        if (friendsocketid) {
          io.to(friendsocketid).emit("offline", { userId: socket.userid });
        }
      })
      onlineUsers.delete(socket.userId);
    })

  })
} 
