import express from "express";
import mongoose from "mongoose";
const requestRouter = express.Router();

import { userAuth } from '../middlewares/auth.js';
import { ConnectionRequestModel } from "../models/connectionRequest.js";
import { User } from "../models/user.js";

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
        if (isRequestExists) throw new Error("request already exists");
        //create a connection request of the given status
        const connectionRequest = new ConnectionRequestModel({ toUserId, fromUserId, status });
        await connectionRequest.save()
        res.json({ "connection": connectionRequest });
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
})

export { requestRouter };