import mongoose from "mongoose";
import { Schema } from "mongoose";
import validator from "validator";

const messageSchema = new Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref:"User",required:true },
    text: {
        type: String,
        required: true,
    },
},
    { timestamps: true },
)

const chatSchema = new Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    messages: [messageSchema],
    isGroup:{
        type:Boolean,
        default:false,
    },
    groupName:{
        type:String,
    },
    groupIconUrl:{
        type:String,
        validate:{
            validator:(value)=>validator.isURL(value)
        },
        default:"https://static.vecteezy.com/system/resources/previews/022/459/085/large_2x/people-group-icon-in-circle-group-of-humans-sign-team-work-symbol-illustration-vector.jpg"
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

})

export const ChatModel = mongoose.model("Chat",chatSchema);

