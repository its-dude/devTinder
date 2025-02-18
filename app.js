import express from 'express';
import {connecDB} from './src/config/mongoose_db.js';
import {User} from './src/models/user.js'
const app=express();


const  PORT=3000;

app.use(express.json());

app.post('/signup',async(req,res)=>{
    try{
        const user=await User.create(req.body);
        res.send("User created !");
    }catch(err){
        console.log("error in creating user : ",err.message);
        res.status(501).send("failed to create user");
    }
})

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



