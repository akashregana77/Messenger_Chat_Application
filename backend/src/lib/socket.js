import express from "express"
import http from "http"
import { Server } from "socket.io"

const app=express();
const server=http.createServer(app);

const ao=process.env.FRONTEND_URL;

const io=new Server(server,{cors:{origin:[ao]}});


function getsocketId(userId){
    return userSocketMap[userId];
}
const userSocketMap={}

io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnLineUsers",Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        if (userId) delete userSocketMap[userId];
        io.emit("getOnLineUsers", Object.keys(userSocketMap));
    });
})

export {app,server,io,getsocketId};