import mongoose from "mongoose"
const {Schema}= mongoose;

const userSchema = new Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String
    },
    gender:{
        type:String
    },
    age:{
        type:Number
    },
    password:{
        type:String
    }
})

export const User = mongoose.model("User",userSchema);