import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { uploadChatMedia, hasImageKitConfig } from "../lib/imagekit.js";
import { getsocketId, io } from "../lib/socket.js";

export async function getUsersForSidebar(req,res,next) {
    try{
        const userId = req.user._id;

        const allUsers = await User.find({_id:{$ne:userId}}).select("-clerkId")

        res.status(200).json(allUsers);
    }catch(err){
        console.log("error in getUsers",err);
        res.status(500).json({message:"Internal server error"});
    }
}

export async function getConversationsForSidebar(req,res,next) {
    try{
        const userId = req.user._id;
        const conversations = await Message.aggregate([
            {$match:{$or:[{senderId:userId},{receiverId:userId}]}},
        
  // 2. Group messages by conversation partner and find the latest message timestamp
                {
                    $group: {
                    // The partner is the other person on the message (not me).
                    _id: { $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"] },
                    lastMessageAt: { $max: "$createdAt" },
                    },
                },

                // 3. Put the most recent conversation at the top.
                { $sort: { lastMessageAt: -1 } },

                // 4. Look up each partner's user profile (comes back as an array).
                { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },

                // 5. Merge the profile details with the existing document (preserving lastMessageAt).
                { 
                    $replaceRoot: { 
                    newRoot: { 
                        $mergeObjects: [ 
                        "$$ROOT", 
                        { $first: "$user" } 
                        ] 
                    } 
                    } 
                },

                // 6. Hide the private clerkId field and remove the raw user array field from the result.
                { $project: { clerkId: 0, user: 0 } },
        ]);
        res.status(200).json(conversations);
    }catch(err){
        console.log("error in get conversations",err);
        res.status(500).json({message:"Internal server error"});
    }
}

export async function getMessages(req,res) {
    try{
        const {id:userChatId} = req.params;
        const myId=req.user._id;
        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userChatId},
                {senderId:userChatId,receiverId:myId}
            ]
        }).sort({createdAt:1});

        res.status(200).json(messages);
    }catch(err){
        console.log("error in get messages",err);
        res.status(500).json({message:"Internal server error"});
    }
}

export async function sendMessage(req,res) {
    try{
        const {text}=req.body;
        const {id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
        let videoUrl;

        if(req.file){
            if(!hasImageKitConfig()){
                return res.status(500).json({message:"media upload is not configured"});
            }

            const url=await uploadChatMedia(req.file);

            if(req.file.mimetype.startsWith("video/"))videoUrl=url;
            else imageUrl=url;
        }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
            video:videoUrl
        })

        await newMessage.save();

        const receiverSocketId=getsocketId(receiverId);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json(newMessage);

    }catch(err){
        console.log("error in send message",err);
        res.status(500).json({message:"Internal server error"});
    }
}