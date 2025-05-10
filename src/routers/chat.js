import express from "express";
const chatRouter = express.Router();

import { userAuth } from '../middlewares/auth.js';
import { User } from "../models/user.js";
import { ConnectionRequestModel } from "../models/connectionRequest.js";
import { ChatModel } from "../models/chat.js";

chatRouter.get('/chat/:toUserid',userAuth,async(req,res)=>{
    try{
        let  user = req.user;
        const toUserId = req.params.toUserid;
        const connection = await ConnectionRequestModel.findOne({
            $or:[{fromUserId:user._id, toUserId:toUserId},
                {fromUserId:toUserId, toUserId:user._id}],
            status:"accepted"
        });
        if(!connection)throw new Error("Sorry, you both are not connected");
        const friend = await User.findOne({_id:toUserId});
        const chat = await ChatModel.find({
            participants:{$all:[user._id,toUserId]}
        }).populate({path:"messages.senderId",select:"firtName lastName"});

         res.render('chat',{user,friend,chat});
    }
    catch(err){
        res.status(400).json(err.message);
    }
});

export {chatRouter};