// // require('dotenv').config({path: './.env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path: './.env'
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8080, () => {
        console.log(`App is keeping on port ${process.env.PORT}`);
    })
}
)
.catch((error) => {
    console.log("Database connection failed", error);
}
)
