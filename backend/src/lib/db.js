import mongoose from "mongoose";

export async function connectDB() {
    try{
        const uri=process.env.MONGODB_URL;
        if(!uri){
            console.log("uri not connected");
        }
        const conn = await mongoose.connect(uri);
        console.log("db connected");
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}