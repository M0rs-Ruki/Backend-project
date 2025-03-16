import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORA_ORIGIN,
    Credential:true,
}));
app.use(express.json({limite: "16kb"}));
app.use(express.urlencoded({extends: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


// Routes import
import userRouter from "./routes/user.routes.js";

// http://localhost:5000/api/v1/users/register

// Routes delcaration
app.use("/api/v1/users" , userRouter)


export default app;
