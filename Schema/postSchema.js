import mongoose from "../DB/index.js";

const filePathSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const userDataSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    avatarPath: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      default: "",
      required: true,
    },
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

  userData: userDataSchema,
});

const blogPost = mongoose.model("blogPost", postSchema);

export default blogPost;
