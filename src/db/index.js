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

