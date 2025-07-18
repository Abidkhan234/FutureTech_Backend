import mongoose from '../DB/index.js'

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true,
        },

        filePath: {
            type: String,
            required: true
        },

        postTime: {
            type: Object,
            required: true
        },

        isLike: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],

        userData: {
            type: mongoose.Schema.Types.Object,
            ref: "User",
            required: true
        }

    },
);

const blogPost = mongoose.model('blogPost', postSchema);

export default blogPost;