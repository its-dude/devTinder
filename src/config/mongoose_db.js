import mongoose from "mongoose";
const uri="mongodb+srv://abhishek10562:%40Backend2003@messanger-cluster.ngrf5.mongodb.net/devTinder" ;
export const connecDB = async ()=>{
    await mongoose.connect(uri);
}
