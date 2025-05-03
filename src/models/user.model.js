import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type:String,
        reqiured:[true, "username is required"],
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        reqiured:[true, "email is required"],
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        reqiured:[true, "Password is required"],
    },
    fullName:{
        type:String,
        reqiured:[true, "Fullname is required"],
    },
    refreshToken:{
        type:String
    },
    avatar:{
        type:String,//URL
        required:true,
    },
    coverImage:{
        type:String, //URL
        required:true
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
},{timestamps:true});

//this is a middleware
//.pre function allow us to modify any field before it saves in the database
userSchema.pre("save", async function(next){  //callback function does not provide the this operator
    //if the password is not modified that there is no need to make changes in the database
    if (!this.isModified("password")) {
     return next();   
    }

    //passwod is modified
    //the new password in converted into hash
    this.password = await bcrypt.hash(this.password, 10);
    next();  //it allows the middlewares(if any ) to continue 
})

//checks if the password inputed by the user is correct one stored in the database
//if corrects then the user logs in 
userSchema.methods.isPasswordCorrect = async function(password) {
    return  await  bcrypt.compare(password, this.password);
    //return true or false
}

//sign method generate the access token based on some prameters
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        //payload oject
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullName:this.fullName,
        },

        process.env.ACCESS_TOKEN_SECRET,

        //requires token expiry in an object
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullName:this.fullName,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);