import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY=256648818523798, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadFileOnCloudinary = async(localFilePath) =>{
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        });

        console.log("Response after uploading the file  ", response.url)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //removes the unwanted files if it fails to upload
        return null;
    }
}


export {uploadFileOnCloudinary};