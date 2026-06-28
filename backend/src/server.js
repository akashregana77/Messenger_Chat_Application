import express from "express";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const frontend = process.env.FRONTEND_URL;

app.use(express.json());
app.use(cors({
    origin: frontend,
    credentials: true
}));
app.use(clerkMiddleware());

app.get("/check", (req, res) => {
    res.status(200).send("hello");
});

const publicDir = path.join(__dirname, "..", "public");

if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(publicDir, "index.html"));
    });
}

app.listen(port, () => {
    connectDB();
    console.log(`server is running in the port :${port}`);
});