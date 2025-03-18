import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiError } from "../utils/apierror.js";
import { apiResponse } from "../utils/apiResponse.js";



const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken  = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        
        throw new apiError(500, " Somthing went wrong whill generating referesh token")
    }
}

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

const loginUser = asyncHandler( async(req, res) => {
    // req body -> data
    // username  or email
    // find user exists or not
    // password check
    // access refresh token
    // send cookie

    const { email, username , password} = req.body;

    if ( !(email || username)) {
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

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(User._id)

    const loginUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken)
    .json(
        new apiResponse(
            200,{
                user: loginUser, accessToken,refreshToken
            }, "user login successfully "
        )
    )
})

const logoutUser =  asyncHandler( async( req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {accessToken}
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


export { registerUser,loginUser, logoutUser };