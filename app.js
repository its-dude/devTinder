import express from 'express';
import {connecDB} from './src/config/mongoose_db.js';
import {User} from './src/models/user.js'
const app=express();


const  PORT=3000;

app.use(express.json());
//create user
app.post('/signup',async(req,res)=>{
    try{
        const user=await User.create(req.body);
        res.send("User created !");
    }catch(err){
        res.status(501).send("SIGNUP FAILED : "+err.message);
    }
})

//find a user
app.get('/user', async(req,res)=>{
    try{
        const user = await User.findOne({emailId:req.body.email});
        res.send(user);
    }catch(err){
        console.log(err.message);
        res.status(404).send("user doesn't exist");
    }
})

//get all users
app.get('/feed',async(req,res)=>{
    try{
        const users =await User.find({});
        res.send(users);
    }catch(err){
        console.log(err.message);
        res.status(404).send("No users");
    }
})

//delelte a user
app.delete('/user',async (req,res)=>{
    try{
        const userId = req.body.userid;
        await User.findByIdAndDelete(userId);
        res.send("user deleted successfully");
    }catch{
        res.status(404).send("User not found");
    }
})

app.patch('/user/:userid',async(req,res)=>{
    const userid=req.params?.userid;
    const data = req.body;
    try{
        const  ALLOWED_UPDATES =["photoUrl","age","skills","gender","about"]
        const isUpdateAllowed=Object.keys(data).every((key)=>ALLOWED_UPDATES.includes(key));
        if(!isUpdateAllowed)throw new Error("updates not allowed");
        const opts = { runValidators: true };
        const user=await User.findByIdAndUpdate(userid,data,opts);
        res.send("updated successfully");
    }catch(err){
        res.status(404).send("UPDATE FAILED : "+err.message);
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



