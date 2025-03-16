import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 

// Upload file on cloudinary
const uploadOnCloudinary = async (localfilePath) => {
    try {
        if (!localfilePath) return null
        
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto",
        })
        console.log("THe file has been uploaded", response.url);
        return response
        
    } catch (error) {
     fs.unlinkSync(localfilePath)
        console.log("Error while uploading the file", error);
        return null   
    }
}

export { uploadOnCloudinary }