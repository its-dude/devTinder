const validateProfileInfoEdit = function (req){
    const allowedInfo = ["firstName","lastName","age","gender","skills","about","photoUrl"];
    if (req.body["photoUrl"]?.length === 0) delete req.body["photoUrl"];
    const isAllowed = Object.keys(req.body).every( field => {
        return allowedInfo.includes(field);
    });
    return isAllowed;
}

export default validateProfileInfoEdit;