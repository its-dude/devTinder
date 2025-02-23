import mongoose from "mongoose";
const  {Schema} = mongoose;
const connectionRequestSchema = new Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        enum:{
            values:["accepted","rejected","ignore","interested"],
            message: `{value} is incorrect status type`
        }
    }
},{timstamps:true});

connectionRequestSchema.index({fromUserId:1,toUserId:1});

connectionRequestSchema.pre("save",function(next){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        return next(new Error("You can not send request to yourself") );
    }
    next();
})

export const ConnectionRequestModel = mongoose.model("ConnectionRequest",connectionRequestSchema);