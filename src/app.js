import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//middleware to accept requests from the defined cors origin
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true,
    }
))

//json data is limited to prevent the server from overwhelming data
app.use(express.json({limit:"16kb"}));

//complex data structures can be passed to the url with the urlencoded method
app.use(express.urlencoded({extended:true, limit:"16kb"}));

//static files and data are stored in the public folder
app.use(express.static("public"))

//it stores the cookie in the browser from the server
app.use(cookieParser());


//router import
import userRoute from "./routes/userRoute.js";

//router declaration
app.use("/api/v1/user", userRoute);


export {app}
    