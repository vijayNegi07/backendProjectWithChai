import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandle.js";
import { User } from "../models/user.model.js";


const verifyJWT = asyncHandler(async(req, res, next)=>{

    console.log("Cookies --- ", req.cookies)
    //access the token from the cookie or header
    //they are always there in cookie(only if user has logged in before) even after user access the site after a long time
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    //token will be empty only if user didn't even login a single time
    if (!token) {
        throw new ApiError(401, "Invalid user Authorization!");
        //no token - sends the user to the login page
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(403, "Invalid user Token");
        //the token was invalid or expired
        //user gets another acces token by refresh token 
        //if refresh token is also expired then redirected to the login page
    }

    //user is authenticated
    req.user = user;
    console.log("User details in middleware --- ", user._id);
    next();
})


export {verifyJWT};