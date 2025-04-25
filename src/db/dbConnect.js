
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const  connectDB = async() => {
    try {
        //monogoose return the connection response that contain multiple information about the connection and  the host
        const connectionResponse = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        //display the connected host
        console.log(`MONOGODB Connected Successfully !! DB Host ::${connectionResponse.connection.host}`);
        
    } catch (error) {
        console.log("ERROR db connection FAILED ", error);
        //exit the process with the status code 1
        process.exit(1);
    }
}

export default connectDB;