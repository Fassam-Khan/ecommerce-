import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required:true,
        },

        description:{
            type: String,
        },
        file : {
            type: String,

        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
          },
    }
)

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema )


export default Category