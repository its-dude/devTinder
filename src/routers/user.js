import express from "express";
const userRouter = express.Router();

import { userAuth } from "../middlewares/auth.js";
import { ConnectionRequestModel } from "../models/connectionRequest.js";
import { User } from "../models/user.js";

const USER_SAFE_DATA = "firstName lastName photoUrl age about  gender _id";

userRouter.get('/requests/received', userAuth, async (req, res) => {
    //check the user is logged in or not
    //get all the requset for the user with touser=>loggedUserId
    //populate  
    try {
        const loggedUserId = req.user._id;
        const requests = await ConnectionRequestModel.find(
            {
                toUserId: loggedUserId,
                status: "interested"
            }
        ).populate("fromUserId", USER_SAFE_DATA);

        res.json({ requests: requests });
    } catch (error) {
        res.status(400).send("Error:" + error.message);
    }
})

userRouter.get('/connections', userAuth, async (req, res) => {
    //check user is logged in or not
    //check for the request accepted from both user
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const filterConnectionRequests = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            } else {
                return row.fromUserId;
            }
        })
        const user = loggedInUser;
        user.islogin=true;
        const connections = filterConnectionRequests;
        res.status(200).render('connections.ejs',{user,connections});
    } catch (error) {
        res.status(400).send("Error:" + error.message);
    }
})

userRouter.get('/user/feed', userAuth, async (req, res) => {
    //check user is login or not
    //get all the uers fillter  user connecctions
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1;
        const skip = (page-1)*limit;

        if(limit>20)limit=20;


        const userConnections = await ConnectionRequestModel.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
        }).select("fromUserId toUserId");

        const hideUsers = new Set();
        userConnections.forEach(userConnection => {
            hideUsers.add(userConnection.fromUserId.toString());
            hideUsers.add(userConnection.toUserId.toString());
        })

        const users = await User.find({
            $and:[{_id:{$nin:[...hideUsers]}} ,{_id:{$ne:loggedInUser._id}}],
        }).
        select(USER_SAFE_DATA).
        sort({_id:1}).
        skip(skip).
        limit(limit).lean();        
        res.json(users);
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
})

userRouter.get('/feed',userAuth,async (req,res)=>{
    try{
        let user=req.user;
        user.islogin=true;
        
        res.render('feed',{user});
    }catch(err){
        res.send("error: "+err.message);
    }
})
export { userRouter };