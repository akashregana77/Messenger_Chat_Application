import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req,res,next) {
    try{
        const {userId}=getAuth(req);
        if(!userId){
            res.status(401).json({message:"unauthorized"});
            return;
        }

        const user = await User.findOne({clerkId:userId});
        if(!user){
            res.status(404).json({message:"user not found"});
            return;
        }
        req.user=user;
        next();
    }catch(err){
        console.log(err);
        res.status(500).json({message:"internal server error"});
    }
}