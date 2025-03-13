import express from;
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORA_ORI,
    Credential:true,
}));
app.use(express.json({limite: "16kb"}));
app.use(express.urLencoded({extends: true, limit: "16kb"}));
app.use(express.static("public"));

app,use(cookieParser());


export default app;