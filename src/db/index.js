import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const connectDB = async() => {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGOODB_URI}/ ${DB_NAME}`)
        console.log(`MongoDB is connected to ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongooDB is sowing ERROR", error);
        process.exit(1)
    }
}

export default connectDB;



🌟 Day 12/180 | Back-End Development Journey
Today’s Focus: Full-Stack Project Build (Twitter/X + YouTube Clone)
✅ 2-hour live stream: Architected multi-page APIs with Express/MongoDB (watch here).
✅ 6 hours of intense coding:
• Built 20+ pages/endpoints (user auth, post creation, video upload simulations).
• Integrated MongoDB for scalable data storage (schemas, relationships, middleware).
• Deployed progress to GitHub: https://github.com/M0rs-Ruki/Backend-project

Key Takeaways:
🔹 Complex projects reveal gaps → faster growth.
🔹 Express routing + MongoDB = back-end synergy.
🔹 Version control (GitHub) is non-negotiable for collaboration.

Next: Adding authentication and testing! Feedback/collabs welcome. 🚀