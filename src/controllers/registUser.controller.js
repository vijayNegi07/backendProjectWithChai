import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandle.js";
import {User} from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/Cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req,res)=> {
    

    //extracting form data from the post request 
    const {fullName, username, password, email} = req.body  //destructuring the fields
    console.log("email ", email)

    //checking if any of the fields are empty than throw the error
    if ([fullName, username, password, email].some((field)=>     //if any of them is empty then it return true(some is also a traversal method for arrays)
     field?.trim() === ""   
    )) {
        throw new ApiError(400,"Fields couldnot be empty");
    }

    //check if the user by the username or email exist already or not
    const userExists = await User.findOne({
        $or:[{username},{email}]
    })

    if (userExists) {
        throw new ApiError(409, "User already exists with same usename or email ")
    }


    //extracting the avatar and coverImage from the request
    //express doesnot provide the facility to upload the images and files by default
    //multer is used for such purpose(.files() method is not present by default, added by multer )
    const avatarLocalFilePath = req.files?.avatar[0]?.path;

    const coverImageLocalFilePath = req.files?.coverImage[0]?.path;
    console.log(req.files);
    console.log(avatarLocalFilePath , coverImageLocalFilePath)

    if (!avatarLocalFilePath && !coverImageLocalFilePath) {
        throw new ApiError(400, "Avatar and Cover Image are required ")
    }

    const avatarURI = await uploadFileOnCloudinary(avatarLocalFilePath);
    const coverImageURI = await uploadFileOnCloudinary(coverImageLocalFilePath);

    if (!avatarURI && !coverImageURI) {
        throw new ApiError(500, "There is some issue while uploading images")
    }

    console.log(avatarURI.url , coverImageURI.url);
    

    const user = await User.create({
        username, 
        fullName,
        email,
        password,
        avatar:avatarURI.url,
        coverImage:coverImageURI.url,
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!userCreated) {
        throw new ApiError(500, "Something went wrong while creating user ")
    }


    res.status(200).json(
        new ApiResponse(200, "User created Successfully! ", userCreated)
    )
})


export {registerUser};
