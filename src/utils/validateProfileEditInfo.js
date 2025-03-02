const validateProfileInfoEdit = function (req){
    const allowedInfo = ["firstName","lastName","age","gender","skills","about","photoUrl"];
    const isAllowed = Object.keys(req.body).every( field => allowedInfo.includes(field) );
    return isAllowed;
}

export default validateProfileInfoEdit;