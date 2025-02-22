import validator from "validator";
import bcrypt from "bcrypt"

const passwordValidator =async function (req){
    const {oldPassword,newPassword} = req.body;
    const userPreviousPassword = req.user.password;
    const iscorrect = await bcrypt.compare(oldPassword,userPreviousPassword) ;
    return iscorrect;
}

const isFormatCorrect = function (password){
    return validator.isStrongPassword(password);
}

export {passwordValidator,isFormatCorrect};