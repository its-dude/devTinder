import express from "express";
const userRouter = express.Router();

import { userAuth } from "../middlewares/auth.js";
import { ConnectionRequestModel } from "../models/connectionRequest.js";

const USER_SAFE_DATA ="firstName lastName photoUrl about skills gender";

userRouter.get('/requests/received',userAuth,async (req,res)=>{
    //check the user is logged in or not
    //get all the requset for the user with touser=>loggedUserId
    //populate  
    try{
        const loggedUserId = req.user._id;
        const requests = await ConnectionRequestModel.find(
            {
              toUserId:loggedUserId,
              status:"interested"
            }
        ).populate("fromUserId",USER_SAFE_DATA);

        res.json({requests:requests});
    }catch(error){
        res.status(400).send("Error:"+error.message);
    }
})

userRouter.get('/connections',userAuth,async (req,res)=>{
    //check user is logged in or not
    //check for the request accepted from both user
    try{
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
        $or:[
            {fromUserId:loggedInUser._id ,status:"accepted"},
            {toUserId:loggedInUser._id ,status:"accepted"}
        ]
    }).populate("fromUserId",USER_SAFE_DATA)
      .populate("toUserId",USER_SAFE_DATA);
    
    const filterConnectionRequests = connectionRequests.map((row)=>{
        if(row.fromUserId._id.toString()===loggedInUser._id.toString()){
            return row.toUserId;
        }else{
            return row.fromUserId;
        }
    })
    res.status(200).json({connections:filterConnectionRequests});
    }catch(error){
        res.status(400).send("Error:"+error.message);
    }
})

userRouter.get('/feed',userAuth,async (req,res)=>{
    //check user is login or not
    //get all the uers fillter  user connecctions
    try{
        
    }catch(error){
        res.status(400).send("Error:"+error.message);
    }
})

export {userRouter};