import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiError } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/Subscription.model.js";
import mongoose from "mongoose";



const generateAccessAndRefereshTokens = async(userId) => {
    try {console.log("mors is nood ");
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateAccessToken()


        user.refreshToken  = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        
        throw new apiError(500, " Somthing went wrong whill generating referesh token")
    }
}

////////////////////////////////////////////////////////////////////

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, fullName, email, password } = req.body;

    if ([username, fullName, email, password].some((field) => field?.trim() === '')) {
        throw new apiError(400, 'Please fill in all fields');
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        throw new apiError(409, 'User already exists');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.cover[0]?.path;


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new apiError(400, 'Please upload an avatar');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new apiError(500, 'Error while uploading avatar');
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || null ,
        email,
        password,
    });
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if (!createdUser) {
        throw new apiError(500, 'Error while creating user');
    }

    return res.status(201).json(new apiResponse(200, createdUser, "User created successfully"));
});

/////////////////////////////////////////////////////////////////////

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username  or email
    // find user exists or not
    // password check
    // access refresh token
    // send cookie

    const { email, username , password} = req.body;
    console.log(email);
    

    if ( !(username, email)) {
        throw new apiError(400, "Please provide email or username")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })


    if(!user) {
        throw new apiError(404, " User does not exist !!")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new apiError(401, "User password is Wrong !! ")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loginUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user: loginUser, accessToken,refreshToken
            }, "user login successfully "
        )
    )
})

////////////////////////////////////////////////////////////////////

const logoutUser =  asyncHandler( async( req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },{new: true}
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200), {}, "User logged Out ")
})

////////////////////////////////////////////////////////////////////

const refreshAccessToken = asyncHandler(async(req, res) =>{
    const incomingRefresToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefresToken) {
        throw new apiError(401, "unauthorized requrst")
    }
try {
        const decodedToken = jwt.verify(
            incomingRefresToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apiError(401, "Invalid refres token!!!!!!")
        }
    
        if (incomingRefresToken !== user?.refreshToken){
            throw new apiError(401, "Refresh token is invalid or used!!!!!")
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken  } = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new apiResponse(
                200, 
                {accessToken , refreshToken: newRefreshToken},
                "Access Token is refreshed happy"
            )
        )
} catch (error) {
    throw new apiError(401,error?.message || "Invalid refres token!")
}

})

////////////////////////////////////////////////////////////////////

const changeCurrentPassword = asyncHandler(async(req, res) => {

    const {oldPassword, newPassword,confPassword} = req.body

    if (!(newPassword === confPassword)) {
        throw new apiError(400, "Not maching new and Confirm password!!!!")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid PASSWORD !!!!!!")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password Changed successfully...."))

})

////////////////////////////////////////////////////////////////////

const getCurrentUser  = asyncHandler(async(req, res) => {
    return res
    .status(200, )
    .json(200, req.user, "current user fetched successfully.....")
})

////////////////////////////////////////////////////////////////////

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new apiError("400", "All fields are requird!!!")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{fullName, email}
        },{new : true}
    ).select("-password")

    return res.user
    .status(200)
    .json( new apiResponse(200, user, "Accound details updated....."))


})

////////////////////////////////////////////////////////////////////

const updateUserAvater = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.files?.path
    
    if (!avatarLocalPath) {
        throw new apiError(400, "Avater file missing!!!!!!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new apiError(500, "Error while uploading avatar");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {avatar: avatar.url}
        },{new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Avater uploded successfully......"))



})

////////////////////////////////////////////////////////////////////

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverLocalPath = req.files?.path
    
    if (!coverLocalPath) {
        throw new apiError(400, "Cover file missing!!!!!!")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading cover");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {avatar: coverImage.url}
        },{new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Cover Image uploded successfully......"))


})

////////////////////////////////////////////////////////////////////

const getUserChannelProfile = asyncHandler(async(req, res) =>{
    const {username} = req.params
    
    if (!username?.trim() ) {
        throw new apiError(400, "Username is required!!!")
    }
    const channel = await User.aggregate([
        {
            $match: {username: username?.toLowerCase()}
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribersTO"
            }
        },
        {
            $addFields: {
                SubscriberCount: {$size: "$subscribers"},
                channelSubscriberCount: {$size: "$subscribersTO"},
                isSubscribed: {$cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }}
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                SubscriberCount: 1,
                channelSubscriberCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
                }
        }

    ])

    if (!channel?.length) {
        throw new apiError(404, "channel dos not exist!!!!!")
    }
    return res
    .status(200)
    .json(new apiResponse(200, channel[0],"User channel profile fetched successfully" ))
})

////////////////////////////////////////////////////////////////////

const getWatchHistory = asyncHandler(async(req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {   
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {$first: "$owner"}
                        }
                    }
                ]
            }
        },

    ])

    return res
    .status(200)
    .json( new apiResponse(200,user[0].watchHistory, "watch history fetched successfully...."))
})

export { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvater,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
 };  
