// require('dotenv').config({path: './.env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({path: './.env'});

connectDB()
.then(() => {
    console.log("Database connected successfully");
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is keeping on port ${process.env.PORT}`);
    })
}
)
.catch((error) => {
    console.log("Database connection failed", error);
}
)




















/*
import express from "express";
const app = express();

;(async() => {
    try {
        await mongoose.connect(`${process.env.MONGOODB_URI}/ ${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR" , error);
            throw error 
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is working on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR" ,error);
        throw error
        
    }
} ) ()
*/
