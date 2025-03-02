import express from "express";
import bcrypt from "bcrypt";
const authRouter = express.Router();
import path from 'path';

import { fileURLToPath } from 'url';
import {validation} from '../utils/validation.js';
import {User} from '../models/user.js';
import { userAuth } from '../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//create user
authRouter.get('/signup',(req,res)=>{
    const user ={};
    res.render('signup',{user});
})

authRouter.post('/signup',async(req,res)=>{
    try{
        //validation
        validation(req);
       const {firstName,lastName,emailId,password,gender,skills,age,about,photoUrl}=req.body;
       const hash = await bcrypt.hash(password, 10); 
        try{
            const user=await User.create({firstName,lastName,emailId,password:hash,skills,gender,age,about,photoUrl});
            res.status(200).json({"msg":"success"});
        }catch(err){
            res.status(501).json({"error":"SIGNUP FAILED : "+err.message});
        }
    }
    catch(error){
        res.status(400).json({"error":error.message});
   }
})
//login
authRouter.get('/login',(req,res)=>{
    try{ 
    const user ={};
    res.render('login',{user});
    }catch(error){
        res.status(500).send("Error : "+error.message);
    }
})

authRouter.post('/login',async(req,res)=>{
    try{
        //check password is correct or not
        const {emailId,password} = req.body;
        const user=await User.findOne({emailId});
        if(!user){throw new Error("check your email or password")};//if user not found
        const iscorrect=await user.validatePassword(password);//compare  the password 
        if(!iscorrect){throw new Error("check your email or password")};
        const token= await user.getJWT();
        //set cookie
        res.cookie("_id",token);
        res.redirect("/profile");
    }catch(err){
        res.status(400).send(err.message);
    }
})

authRouter.post('/logout',async(req,res)=>{
    try{
        res.clearCookie('_id');
        res.send("succesfully logged out");
    }catch(error){
        res.status(400).send("Error : "+error.message);
    }
})

export {authRouter};