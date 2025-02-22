import validator from "validator";


export const validation=(req)=>{
    const { firstName,lastName, password, emailId, gender,skills,age } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Name is not valid");
    }

    if (!validator.isStrongPassword(password, { minSymbols: 1, minUppercase: 1, minNumbers: 1 })) {
        throw new Error("Password must contain a special character, a capital letter, and a number");
    }

    if (emailId===undefined ||  !emailId || !validator.isEmail(emailId)) {
        throw new Error("Invalid emailId ");
    }

    if (gender !== "male" && gender !== "female" && gender !== "others") {
        throw new Error("Select a proper gender");
    }

    if(skills.length > 10){
        throw new Error("skills can not be more than 10");
    }
}

