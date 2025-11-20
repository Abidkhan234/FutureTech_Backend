import mongoose from "../DB/index.js";

const filePathSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  filePath: filePathSchema,

  postTime: {
    type: Object,
    required: true,
  },

  isLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  userData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const blogPost = mongoose.model("blogPost", postSchema);

export default blogPost;
