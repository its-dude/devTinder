import mongoose from "mongoose"
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
const {Schema}= mongoose;
import validator from "validator"

const userSchema = new Schema( {
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        unique:true,
        trim:true,
        toLowerCase:true,
        required:true,
        validate:{
            validator:(value)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message:"Invalid email format"
        }
    },
    gender:{
        type:String,
        validate:{
            validator:(value)=>["male","female","others"].includes(value),
            message:"Gender data is not valid"
        }
    },
    age:{
        type:Number,
        required:true,
        min:[18,"Age must be at least 18"],
        max:[100,"Age cannot exceed 100"],
        validate:{
            validator:Number.isInteger,
            message:"Age must be a number"
        }
    },
    password:{
        type:String,
        required:true,
        validate:{
            validator:(value)=>validator.isStrongPassword(value)
        }        
    },
    photoUrl:{
        type:String,
        validate:{
            validator:(value)=>validator.isURL(value)
        },
        default:"https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg"
    },
    skills:{
        type:[String],
        validate:{
            validator:(value)=>value.length<=10,
            message:"Skills can not be more than 10"
        }
    },
    about:{
        type:String,
        maxlength:[200,"Only 200 characters are allowed"]
    }
},{timestamps:true})

userSchema.methods.getJWT = async function(){
    const user =this;
    const token=jwt.sign({id:user._id},"dev@tinder",{expiresIn:'7d'});
    return token;
}

userSchema.methods.validatePassword=async function(enteredPassword){
    const user= this;
    const hashedPassword = user.password;
    const isPasswordCorrect=await bcrypt.compare(enteredPassword,hashedPassword)
    return isPasswordCorrect;
}

export const User = mongoose.model("User",userSchema);