import connectDB from "./db/dbConnect.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
})


connectDB();