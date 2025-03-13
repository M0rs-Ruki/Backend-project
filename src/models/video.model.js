import mongoose , {schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new schema({

    videoFile: {
        type: String, // Cloudinary URL
        required: true,
    },
    thumbnail: {
        type: String, 
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPubliced: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: schema.Types.ObjectId,
        ref: "User",
    }

}, { timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate)


export const Video = schema.model("Video", videoSchema);

