import { Router } from "express";
import { changeCurrentPassword, 
    loginUser, 
    logoutUser, 
    registerUser, 
    updateUserAvater, 
    updateUserCoverImage,
    updateAccountDetails,
    getUserChannelProfile,
    getWatchHistory,
    changeCurrentPassword,
    getCurrentUser,} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import { updateAccountDetails } from "../controllers/user.controller.js";
import { getUserChannelProfile } from "../controllers/user.controller.js";
import { getWatchHistory } from "../controllers/user.controller.js";



const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "cover", maxCount: 1 }
    ]),registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account_details").patch(verifyJWT, updateAccountDetails)

router.route("/avater").patch(verifyJWT,upload.single("avater"),updateUserAvater)
router.route("/cover").patch(verifyJWT,upload.single("cover"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router
