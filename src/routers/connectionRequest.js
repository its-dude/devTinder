import  express from "express";
const requestRouter = express.Router();

import { userAuth } from '../middlewares/auth.js';

requestRouter.post('/sendConnectionRequest',userAuth,async(req,res)=>{
    res.send("request sent");
})

export {requestRouter} ;