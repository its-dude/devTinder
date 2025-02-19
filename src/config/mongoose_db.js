import mongoose from "mongoose";
const uri="mongodb+srv://abhishek10562:%40Backend2003@messanger-cluster.ngrf5.mongodb.net/devTinder" ;
const connecDB = async ()=>{
    await mongoose.connect(uri);
}
const disconnecDB=async()=>{
    await mongoose.disconnect(uri);
}

export {connecDB,disconnecDB};