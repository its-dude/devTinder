import jwt from "jsonwebtoken";
import { User } from '../models/user.js';
export const userAuth = async (req, res, next) => {
    try {
        const { _id } = req.cookies;
        if (!_id) { throw new Error("token is not valid") }
        const decoded = jwt.verify(_id, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decoded.id });
        if (!user) { throw new Error("User not found") };
        req.user = user;
        next();
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
}; 