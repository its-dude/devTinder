import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import methodOverride from 'method-override';
import http from 'http';

import { fileURLToPath } from 'url';
import {connecDB} from './config/mongoose_db.js';
import {authRouter} from './routers/auth.js';
import { requestRouter } from './routers/connectionRequest.js';
import { profileRouter } from './routers/profile.js';
import { userRouter } from './routers/user.js';
import {messenger} from './routers/messenger.js'
import {intialiseSocket} from './utils/socket.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();
const server = http.createServer(app);
app.set("view engine",'ejs');

app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '../public/')));


intialiseSocket(server);
const  PORT=process.env.PORT||3000; 


app.use('/',userRouter);
app.use('/',authRouter);
app.use('/',requestRouter);
app.use('/',profileRouter);
app.use('/',messenger);
//to catch any unhandled error
app.get('/', (req, res) => {
    try {
        const user ={};
        user.islogin=false;
        // res.send(`Hello ${user.firstName}`);
        res.render('index',{user});
    } catch (error) {
        res.status(400).send("Error : " + err.message);
    }
}) 

connecDB()
.then(()=>{
    console.log("database connection established...");
    //now if success you can listen to users
    server.listen(PORT,()=>{
        console.log(`Server is listening on port ${PORT}...`);
    })
})
.catch(err=>{
    console.log("error in establishing connection");
})