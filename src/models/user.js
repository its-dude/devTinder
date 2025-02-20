import mongoose from "mongoose"
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
        }
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

export const User = mongoose.model("User",userSchema);