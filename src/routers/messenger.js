import express from "express";
const messenger = express.Router();

import { userAuth } from '../middlewares/auth.js';
import { User } from "../models/user.js";
import { ConnectionRequestModel } from "../models/connectionRequest.js";
import { ChatModel } from "../models/chat.js";

messenger.get('/messenger',userAuth,async(req,res)=>{
    const user=req.user;
    user.chat=true;
    user.islogin=true;
    const chats = await ChatModel.find({
        participants:{$all:[user._id]}
    }).sort({updatedAt:-1}).populate({ path:"messages.senderId",select: "firstName lastName photoUrl" })
      .populate({ path:"participants",select: "firstName lastName photoUrl" })
      .lean();

    const friend={}
    // res.json(chats)
    res.render('messenger',{user,chats,friend});
})

messenger.get('/chat/:toUserid',userAuth,async(req,res)=>{
    try{
        let  user = req.user;
        const toUserId = req.params.toUserid;
        const connection = await ConnectionRequestModel.findOne({
            $or:[{fromUserId:user._id, toUserId:toUserId},
                {fromUserId:toUserId, toUserId:user._id}],
            status:"accepted"
        });
        if(!connection)throw new Error("Sorry, you both are not connected");
        const chat = await ChatModel.findOne({
            participants:{$all:[user._id,toUserId]},
            isGroup:false,
        }).populate({ path:"messages.senderId",select: "firstName lastName photoUrl lastActive" });
         user.chat=true;
        //  res.render('chat',{user,friend,chat});
        res.json(chat);
    }
    catch(err){
        res.status(400).json(err.message);
    }
});

messenger.post('/createGroup',userAuth,async(req,res)=>{
     try{
         const {groupName,groupIconUrl,members}=req.body;
         const groupChat = await ChatModel.create({
          isGroup:true,
           groupName,
           groupIconUrl,
           admin:req.user._id,
           participants:[...members,req.user._id],
         })
         res.status(200).json(groupChat);
     }
     catch(err){
        res.status(400).json(err.message);
     }
})

messenger.get('/groupChat/:chatId',userAuth,async(req,res)=>{
    try {
        const chat = await ChatModel.findOne({_id:req.params.chatId})
                                    .populate({ path:"messages.senderId",select: "firstName lastName photoUrl lastActive" })
                                    .lean()
        res.json(chat);
    } catch (error) {
        res.status(400).json(error.message);
    }
})

export {messenger};