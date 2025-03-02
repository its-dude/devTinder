import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import { fileURLToPath } from 'url';
import {connecDB} from './src/config/mongoose_db.js';
import {authRouter} from './src/routers/auth.js';
import { requestRouter } from './src/routers/connectionRequest.js';
import { profileRouter } from './src/routers/profile.js';
import { userRouter } from './src/routers/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();

const  PORT=3000; 

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, './src/public/')));

app.use('/',userRouter);
app.use('/',authRouter);
app.use('/',requestRouter);
app.use('/',profileRouter);

connecDB()
.then(()=>{
    console.log("database connection established...");
    //now if success you can listen to users
    app.listen(PORT,()=>{
        console.log("Server is listening on port 3000...");
    })
})
.catch(err=>{
    console.log("error in establishing connection");
}) 