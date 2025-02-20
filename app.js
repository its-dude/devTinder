import express from 'express';
import {connecDB} from './src/config/mongoose_db.js';
import {User} from './src/models/user.js';
import {validation} from './src/utils/validation.js';
import bcrypt from "bcrypt";
const app=express();

 
const  PORT=3000; 

app.use(express.json());
//create user
app.post('/signup',async(req,res)=>{
    try{
        //validation
        validation(req);
    
       const {firstName,emailId,password,gender,skills,age}=req.body;
       const hash = await bcrypt.hash(password, 10); 
        try{
            const user=await User.create({firstName,emailId,password:hash,skills,gender,age});
            res.send("User created !");
        }catch(err){
            res.status(501).send("SIGNUP FAILED : "+err.message);
        }
    }
    catch(error){
        res.status(400).send("Error : ",error.message);
   }
})
//login
app.post('/login',async(req,res)=>{
    //check password is correct or not
    const {emailId,password} = req.body;
    const user=await User.findOne(emailId);
    if(!user){res.status(400).send("check your email or password")};//if user not found
    const iscorrect=await bcrypt.compare(password,user.password);//compare  the password 
    if(!iscorrect){res.status(400).send("check your email or password")};
    //redirect to some page
    res.send("login succesfull....");
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



