import mongoose from "mongoose";
const connecDB = async ()=>{
    await mongoose.connect(process.env.MONGO_URI);
}
const disconnecDB=async()=>{
    await mongoose.disconnect(uri);
}

export {connecDB,disconnecDB};