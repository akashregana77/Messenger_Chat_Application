import express from "express";
import "dotenv/config"
import { connectDB } from "./lib/db.js";
import {clerkMinddleware} from "@clerk/express";
import cors from "cors";

const app=express()
const port=process.env.PORT;
const frontend=process.env.FRONTEND_URL;

app.use(express.json());
app.use(cors({
    origin:frontend,
    credentials:true
}));
app.use(clerkMinddleware());


app.get("/check",(req,res)=>{
    res.status(200).send("hello")
})

app.listen(port,()=>{
    connectDB();
    console.log(`server is running in the port :${port}`);
})