import express from 'express';
import cookieParser from 'cookie-parser';

import {connecDB} from './src/config/mongoose_db.js';
import {authRouter} from './src/routers/auth.js';
import { requestRouter } from './src/routers/connectionRequest.js';
import { profileRouter } from './src/routers/profile.js';

const app=express();

const  PORT=3000; 

app.use(express.json());
app.use(cookieParser());

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