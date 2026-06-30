import express from 'express';
import User from '../models/user.model.js';
import {verifyWebhook} from '@clerk/backend/webhooks'

const router = express.Router();

router.post("/",async (req,res)=>{
    try{
        const signingSecret=process.env.CLERK_WEBHOOK_SIGNING_SECRET;
        if(!signingSecret){
            res.status(503).json({message:"webhook secret is not provided"});
            return;
        }

        const payload = Buffer.isBuffer(req.body)?req.body.toString("utf8"):String(req.body);
        const request = new Request("http://internal/webhooks/clerk",{
            method:"POST",
            headers:new Headers(req.headers),
            body:payload
        })

        const evt=await verifyWebhook(request,{signingSecret});

        if(evt.type==="user.created" || evt.type==="user.updated"){
            const d=evt.data;
            const email=
            d.email_addresses?.find((e)=>e.id===d.primary_email_address_id)?.email_address??
            d.email_addresses?.[0]?.email_address;

            const fullName =
            [d.first_name, d.last_name].filter(Boolean).join(" ") || d.username || email?.split("@");

            await User.findOneAndUpdate(
            { clerkId: d.id },
            { clerkId: d.id, email, fullName, profilePic: d.image_url },
            { new: true, upsert: true, setDefaultOnInsert: true },
            );   
        }

        if(evt.type==="user.deleted"){
            if(evt.data.id)await User.findOneAndDelete({clerkId:evt.data.id}); 
        }

        res.status(200).json({received:true});
    }catch(err){
        console.log("error in webhook",err);
    }
})

export default router;