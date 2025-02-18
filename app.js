import express from 'express';
import {connecDB} from './src/config/mongoose_db.js';
import {User} from './src/models/user.js'
const app=express();


const  PORT=3000;

app.use('/signup',async(req,res)=>{
    try{
        const user=await User.create({
            firstName:"Abhishek",
            lastName:"Mishra",
            emailId:"abhishek@gmail.com",
            password:"password"
        })
        res.send("User created !");
    }catch(err){
        console.log("error in creating user : ",err.message);
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



