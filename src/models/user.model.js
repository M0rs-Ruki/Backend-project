import mongoose, { schema} from "mongoose";
import jwp from "jsonwebtoken";
import bcrypt from "bcryptjs";


const userSchema = new schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullNmae: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatae: {
        type: String, // Cloudinary URL
        required: true,
    },
    coverImage: {
        type: String, // Cloudinary URL
        required: true,
    },
    watchHistory: [{
        type: schema.Types.ObjectId,
        ref: "Video",
    }],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    }


}, { timestamps: true });


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) return next();

        this.password = await bcrypt.hash(this.password, 10)
    next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwp.sign({
        _id: this._id,
        email: this.email,
        username: this.User,
        fullNmae: this.fullNmae,
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    })
}
userSchema.methods.generateRefreshToken = function () {
    return jwp.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    })
}


export const User = mongoose.model("User", userSchema);

