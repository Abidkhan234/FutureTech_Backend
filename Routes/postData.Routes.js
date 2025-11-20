import express from "express";
import upload from "../MiddleWare/MulterConfig.js";
import blogPost from "../Schema/postSchema.js";
import auth from "../MiddleWare/authConfig.js";
import "dotenv/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import {
  uploadFileToCloudinary,
  removeFileFromCloudinary,
} from "../Utils/Cloudinary.js";

dayjs.extend(utc);
dayjs.extend(timezone);
const postData = express.Router();

// For getting all post
postData.get("/", async (req, res) => {
  try {
    const allPosts = await blogPost.find({});

    if (!allPosts) {
      return res.status(404).send({ status: 404, message: "No posts found" });
    }

    res.status(200).send({ status: 200, allPosts });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 500, message: "Failed to fetch posts" });
  }
});
// For getting all post

// For only getting liked posts

postData.get("/like-posts", auth, async (req, res) => {
  try {
    const { userId } = req.userData;

    const allLikedPosts = await blogPost.find({ isLike: userId });

    res.status(200).send({ status: 200, allLikedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 500, message: "Internal Error" });
  }
});

// For only getting liked posts

postData.post("/add-post", auth, upload.single("File"), async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer;
    const fileSize = req.file?.size;
    const mime = req.file?.mimetype;

    const { _id } = req.userData;

    if (!fileBuffer) {
      return res.status(400).send({
        status: 400,
        message: "Something went wrong while uploading post",
      });
    }

    if (fileSize && fileSize > 1 * 1024 * 1024) {
      return res
        .status(400)
        .json({ status: 400, message: "File size must be under 1 MB" });
    }

    const filePath = await uploadFileToCloudinary(fileBuffer, mime);

    const postTime = {
      month: dayjs().tz("Asia/Karachi").format("MMMM"),
      day: dayjs().tz("Asia/Karachi").format("D"),
      time: dayjs().tz("Asia/Karachi").format("h:mm A"),
      year: dayjs().tz("Asia/Karachi").format("YYYY"),
    };

    const newPost = new blogPost({
      filePath: {
        url: filePath.url,
        public_id: filePath.public_id,
      },
      postTime,
      userData: _id,
      ...req.body,
    });

    await newPost.save();

    res.status(201).send({ status: 201, message: "Post Added Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
});

postData.patch("/like-posts/:id", auth, async (req, res) => {
  try {
    const { _id } = req.userData;

    const postId = req.params.id;

    const post = await blogPost.findById(postId);

    if (!post) {
      res.status(404).send({ status: 404, message: "Post not found" });
    }

    const likedPost = post.isLike.includes(_id);

    if (likedPost) {
      post.isLike.pull(userId); //For removing
    } else {
      post.isLike.push(userId); //For adding
    }

    await post.save();

    res.status(200).send({
      status: 200,
      message: likedPost ? "Post unliked" : "Post liked",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 500, message: "Internal Error" });
  }
});

postData.delete("/delete-post/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const post = await blogPost.findOne({ _id: id });

    if (!post) {
      return res.status(404).send({ status: 404, message: "Post not found" });
    }

    await removeFileFromCloudinary(post.filePath?.public_id);

    await blogPost.findByIdAndDelete({ _id: id });

    res.status(200).send({ status: 200, message: "Post Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
});

postData.patch(
  "/update-post/:id",
  auth,
  upload.single("File"),
  async (req, res) => {
    try {
      const id = req.params.id;

      const fileBuffer = req.file?.buffer;
      const fileSize = req.file?.size;
      const mime = req.file?.mimetype;

      const post = await blogPost.findById(id);

      if (!post) {
        return res.status(404).send({ status: 404, message: "Post not found" });
      }

      if (fileBuffer && fileSize > 1 * 1024 * 1024) {
        return res
          .status(400)
          .json({ status: 400, message: "File size must be under 1 MB" });
      }

      const postTime = {
        month: dayjs().tz("Asia/Karachi").format("MMMM"),
        day: dayjs().tz("Asia/Karachi").format("D"),
        time: dayjs().tz("Asia/Karachi").format("h:mm A"),
        year: dayjs().tz("Asia/Karachi").format("YYYY"),
      };

      const updatedData = {
        ...req.body,
        postTime,
        filePath: {
          url: post.filePath.url,
          public_id: post.filePath.public_id,
        },
      };

      if (fileBuffer) {
        try {
          await removeFileFromCloudinary(post.filePath.public_id);

          const publicPath = await uploadFileToCloudinary(fileBuffer, mime);

          if (!publicPath) {
            return res
              .status(400)
              .send({ message: "Error while uploading to cloudinary" });
          }

          updatedData.filePath.url = publicPath.url;

          updatedData.filePath.public_id = publicPath.public_id;
        } catch (error) {
          console.log(
            "Error while removing and updating image form cloudinary",
            error
          );
          throw error;
        }
      }

      await blogPost.findByIdAndUpdate(id, updatedData);

      res.status(200).send({ status: 200, message: "Updated Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: 500, message: "Internal Error" });
    }
  }
);

export default postData;
