import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
    {
        
        file:{
            type: String
        }

    }
)

const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema )


export default Media