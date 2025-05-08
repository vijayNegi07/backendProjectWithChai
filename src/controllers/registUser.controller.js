import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandle.js";
import {User} from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/Cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateTokens = async(user) =>{
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    //updating the refreshToken object in userSchema
    user.refreshToken = refreshToken;

    //recheck
    //updating the user database 
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken};
}


const registerUser = asyncHandler(async (req,res)=> {
    

    //extracting form data from the post request 
    const {fullName, username, password, email} = req.body  //destructuring the fields
    console.log("req.body object contains \n", req.body)

    //checking if any of the fields are empty than throw the error
    if ([fullName, username, password, email].some((field)=>     //if any of them is empty then it returns true(some is also a traversal method for arrays)
     field?.trim() === ""   
    )) {
        throw new ApiError(400,"Fields couldnot be empty");
    }

    //check if the user by the username or email exist already or not
    const userExists = await User.findOne({   //findOne is the method to find a entity in data model
        $or:[{username},{email}]             //$or is the operator if any of them is true and then the whole ouput is true
    })

    if (userExists) {
        throw new ApiError(409, "User already exists with same usename or email ")
    }


    //extracting the avatar and coverImage from the request
    //express doesnot provide the facility to upload the images and files by default
    //multer is used for such purpose(.files() method is not present by default, added by multer )

    const avatarLocalFilePath = req.files?.avatar[0]?.path; //req.files contains avatar as an object(it is an array) 

    const coverImageLocalFilePath = req.files?.coverImage[0]?.path;  //same as avatar
    console.log(req.files);
    console.log(avatarLocalFilePath , coverImageLocalFilePath)

    if (!avatarLocalFilePath && !coverImageLocalFilePath) {
        throw new ApiError(400, "Avatar and Cover Image are required ")
    }

    //uploading the images on cloudinary which gives us response
    //the  response contains an field url that gives us the public url that we can access anywhere
    const avatarURI = await uploadFileOnCloudinary(avatarLocalFilePath);
    const coverImageURI = await uploadFileOnCloudinary(coverImageLocalFilePath);

    if (!avatarURI && !coverImageURI) {
        throw new ApiError(500, "There is some issue while uploading images")
    }

    console.log(avatarURI.url , coverImageURI.url);
    

    //creating a user object
    const user = await User.create({
        username, 
        fullName,
        email,
        password,
        avatar:avatarURI.url,
        coverImage:coverImageURI.url,
    })

    //retreiving the user information by _id (generally added by mongoDB auto) without password and refreshtoken
    //select method helps to retreive only selected information
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while creating user ")
    }

    //sending status to the frontend
    res.status(200).json(
        new ApiResponse(200, "User created Successfully! ", userCreated)
    )
})


const loginUser = asyncHandler(async (req, res) => {
     //getting user details
    const {username,email, password} = req.body;

    //validation of credentials
    if ([username, email, password].some((field)=>field?.trim() === "")) {
        throw new ApiError(400, "All fields are required ");
    }

     //check if user exists
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist, please register first. ")
    }

    //checking if the password entered by the user matches to one in the database
    if (!user.isPasswordCorrect(password)) {
        throw new ApiError(404, "Password is incorrect! ");
    }

    //generating accessTokens
    const {accessToken, refreshToken} = await generateTokens(user);

    //retreiving only required information from the user object
    const userInfo = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:false,
    }

    //sending response to the front end
    return res.status(200)
    .cookie("accessToken", accessToken, options)  //accessToken as cookie set
    .cookie("refreshToken", refreshToken, options)  //refreshToken as cookie set
    .json(new ApiResponse(
        200,
        "User loged In Sucessfully! Welcome to our world! ",
        {
            user: userInfo, refreshToken, accessToken
        },

    ))
    
})

const logoutUser = asyncHandler(async(req, res)=>{
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: "" }
            //refreshToken:undefined -- this was hitesh's way , but not working for me
        },
        {
            new:true    //returns the update user object
        }
    )

    console.log("user details ----", user)


    const options={
        httpOnly:true,
        secure:false  //for production set it to true, for testing purpose it is true
    }

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out sucessfully! ", {}));
})

export {registerUser, loginUser, logoutUser};
