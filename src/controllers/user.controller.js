import { asyncHandler } from "../utils/asyncHandler.js";
import{ Apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


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

    const { username,fullName, email, password } = req.body
    console.log(username, fullName, email, password);

    if ([username, fullName, email, password].some((filed) => filed?.trim() === '')) {
        throw new Apierror(400, 'Please fill in all fields')
    }
    
    User.findOne({
        $or: [{ username}, { email}]
    })
    if (existingUser) {
        throw new Apierror(409, 'User already exists')
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.cover[0]?.path

    if (!avatarLocalPath){
        throw new Apierror(400, 'Please upload an avatar')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new Apierror(500, 'Error while uploading avatar')
    }

    User.create({
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
    })
    const createdUser =  await User.findById(user._id,).selet(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new Apierror(500, 'Error while creating user')
    }
    
    return res.status(201).json(new ApiResponse(200, createdUser,
         "User created successfully"))

})


export { registerUser }
