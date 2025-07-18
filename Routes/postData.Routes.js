import express from 'express'
import upload from '../MiddleWare/MulterConfig.js';
import fs from "fs-extra"
import blogPost from "../Schema/postSchema.js"
import auth from '../MiddleWare/authConfig.js';
import User from '../Schema/userSchema.js'
import "dotenv/config"
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import uploadFileToCloudinary from "../Utils/Cloudinary.js";

dayjs.extend(utc);
dayjs.extend(timezone);
const postData = express.Router();

// For getting all post
postData.get("/", async (req, res) => {
    try {
        const allPosts = await blogPost.find();

        res.status(200).send(allPosts);
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, message: "Failed to fetch posts" });
    }
});
// For getting all post

// For only getting liked posts

postData.get("/like-posts", auth, async (req, res) => {
    try {

        const { userId } = req.token;

        const allLikedPosts = await blogPost.find({ isLike: userId });

        res.status(200).send({ status: 200, allLikedPosts });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Internal Error" })
    }
})

// For only getting liked posts

postData.post('/', upload.single('File'), auth, async (req, res) => {
    try {

        const filePath = await uploadFileToCloudinary(req.file?.path);

        const { userId } = req.token;

        const postTime = {
            month: dayjs().tz("Asia/Karachi").format("MMMM"),
            day: dayjs().tz("Asia/Karachi").format("D"),
            time: dayjs().tz("Asia/Karachi").format("h:mm A"),
            year: dayjs().tz("Asia/Karachi").format("YYYY"),
        };

        if (!userId) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else if (!filePath) {
            return res.status(400).send({ status: 400, message: "File is required" });
        }

        const userData = await User.findById(userId).select("-password -email");

        const newPost = new blogPost({
            filePath: filePath.url,
            postTime,
            userData,
            ...req.body,
        });

        await newPost.save();

        res.status(200).send({ status: 200, message: "Data Added Successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send({ status: 500, message: "Internal Server Error" });
    }
});

postData.put('/like-posts/:id', auth, async (req, res) => {
    try {
        const { userId } = req.token;

        const postId = req.params.id;

        const post = await blogPost.findById(postId);

        if (!post) {
            res.status(404).send({ status: 404, message: "Post not found" })
        }

        const likedPost = post.isLike.includes(userId);

        if (likedPost) {
            post.isLike.pull(userId) //For removing 
        } else {
            post.isLike.push(userId) //For adding
        }

        await post.save();

        res.status(200).send({ status: 200, message: likedPost ? "Post unliked" : "Post liked", isLike: likedPost });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Internal Error" })
    }
})

postData.delete("/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        const post = await blogPost.findOne({ _id: id });

        if (!post) {
            return res.status(404).send({ status: 404, message: "Post not found" });
        }

        if (post.filePath) {
            fs.removeSync(`./${post.filePath}`);
        }

        await blogPost.deleteOne({ _id: id });

        res.status(200).send({ status: 200, message: "Post Deleted Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 500, message: "Internal Server Error" });
    }
});

postData.put("/:id", auth, upload.single('File'), async (req, res) => {
    try {
        const id = req.params.id;

        const filePath = await uploadFileToCloudinary(req.file?.path);

        const oldFilePath = await blogPost.findOne({ _id: id });

        const postTime = {
            month: dayjs().tz("Asia/Karachi").format("MMMM"),
            day: dayjs().tz("Asia/Karachi").format("D"),
            time: dayjs().tz("Asia/Karachi").format("h:mm A"),
            year: dayjs().tz("Asia/Karachi").format("YYYY"),
        };

        if (!filePath) {

            await blogPost.findByIdAndUpdate(id, {
                filePath: oldFilePath.filePath, postTime, ...req.body,
            }, { new: true });

        } else {

            if (!oldFilePath) {
                return res.status(404).send({ status: 404, message: "Post not found" });
            }

            await blogPost.findByIdAndUpdate(id, {
                filePath: filePath.url, postTime, ...req.body,
            }, { new: true });

        }

        return res.status(200).send({ status: 200, message: "Updated Successfully" })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 500, message: "Internal Error" });
    }
})

export default postData;