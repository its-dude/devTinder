import express from "express";
import bcrypt from "bcrypt"
const profileRouter = express.Router();
import path from 'path';

import { fileURLToPath } from 'url';
import { userAuth } from '../middlewares/auth.js';
import validateProfileEditInfo from "../utils/validateProfileEditInfo.js";
import {passwordValidator,isFormatCorrect} from "../utils/validatePassword.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        // res.send(`Hello ${user.firstName}`);
        res.sendFile(path.join(__dirname,"../public/Html/profile.html"));
    } catch (error) {
        res.status(400).send("Error : " + err.message);
    }
})
profileRouter.get('/profile/user', userAuth, async (req, res) => {
    try {
        const user = req.user;
        // res.send(`Hello ${user.firstName}`);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).send("Error : " + err.message);
    }
})

profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        const isValidEdit = validateProfileEditInfo(req);
        if (!isValidEdit) throw new Error("Invalid edit request");
        const user = req.user;
        Object.keys(req.body).forEach((key) => { user[key] = req.body[key] });
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send("Error : " + error.message);
    }
})

profileRouter.patch('/profile/password', userAuth,async (req, res) => {
    try{
        const isOldPasswordvalid = passwordValidator(req);
        if(!isOldPasswordvalid)throw new Error("Old password isn't correct");

        const newPassword=req.body.newPassword;
        const user=req.user;

        if(!isFormatCorrect(newPassword))throw new Error("Please enter a storng password");
        const hashpassword = await bcrypt.hash(newPassword,10);
        user.password=hashpassword;
        await user.save();
        res.send("Successfully changed password");

    }catch(error){
        res.status(400).send("Error : "+error.message);
    }

})

export { profileRouter };