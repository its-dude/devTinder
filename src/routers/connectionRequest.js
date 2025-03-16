import express from "express";
import mongoose from "mongoose";
const requestRouter = express.Router();

import { userAuth } from '../middlewares/auth.js';
import { ConnectionRequestModel } from "../models/connectionRequest.js";
import { User } from "../models/user.js";
import { compareSync } from "bcrypt";

const USER_SAFE_DATA = "firstName lastName photoUrl age about  gender _id";

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res, next) => {
    try {
        //extract status and userid and then check status is allowed or not 
        //check wheater it is already sent or not or the request is for same user of non existing user
        const status = req.params.status;
        const toUserId = req.params.toUserId;
        const fromUserId = req.user._id;
        const isUserExist = await User.findById(toUserId);

        if (!isUserExist) return res.status(404).json({ "message": "User not found" });

        const allowedStatus = ["ignore", "interested"];
        const isStatusValid = allowedStatus.includes(status);

        if (!isStatusValid) res.status(400).json({ "message": `${status} is not a valid status` });

        const isRequestExists = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId, toUserId, },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })
        console.log(`isrequestexit: ${isRequestExists}`);
        if (isRequestExists) throw new Error("request already exists");
        //create a connection request of the given status
        const connectionRequest = new ConnectionRequestModel({ toUserId, fromUserId, status });
        await connectionRequest.save();
        res.json({ "connection": connectionRequest });
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
})

requestRouter.post('/request/review/:status/:requestId',userAuth,async (req,res)=>{
    //check user is valid or not 
    //status is allowed or not 
    //chek request exists or not
    //get the request for the logged in user i.e touserid

    try{
        const status =req.params.status;
        const loggedInUser=req.user;
        const requestId=req.params.requestId;
        const allowedStatus =["accepted","rejected"];

        if(!allowedStatus.includes(status))return res.status(400).send(`${status} is not a valid status`);

        const request =await ConnectionRequestModel.findOne({
            _id:requestId,
            toUserId:loggedInUser._id,
            status:"interested"
        });

        if(!request)return res.status(404).json({"message":"Request not found"});
        request.status=status;
        await request.save();
        res.json({"requests":request});
    }catch(error){
        res.status(400).send("Error : "+error.message);
    }
})

/*
CREATE requessts api
get all the requests of users
render the info

*/
requestRouter.get('/requests',userAuth,async(req,res)=>{
    try{
        const user = req.user;
        user.islogin = true;
        
        const requests = await ConnectionRequestModel.find({
            toUserId:user._id,
            status:"interested"
        }).populate('fromUserId',USER_SAFE_DATA).lean();
        res.render('requests.ejs',{user,requests});
    }catch(err){
         res.status(400).json(err.message);
    }
})
export { requestRouter };