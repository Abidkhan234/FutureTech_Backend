import express from 'express'
import upload from '../MiddleWare/MulterConfig.js';
import blogPost from "../Schema/postSchema.js"
import auth from '../MiddleWare/authConfig.js';
import User from '../Schema/userSchema.js'
import "dotenv/config"
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { uploadFileToCloudinary, removeFileFromCloudinary } from "../Utils/Cloudinary.js";

dayjs.extend(utc);
dayjs.extend(timezone);
const postData = express.Router();

// For getting all post
postData.get("/", async (req, res) => {
    try {
        const allPosts = await blogPost.find({});

        if (!allPosts) {
            return res.status(404).send({ status: 404, message: "No posts found" })
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
        res.status(500).send({ status: 500, message: "Internal Error" })
    }
})

// For only getting liked posts

postData.post('/add-post', upload.single('File'), auth, async (req, res) => {

    const localFilePath = req.file?.path;

    try {

        const filePath = await uploadFileToCloudinary(localFilePath);

        const { userId } = req.userData;

        const postTime = {
            month: dayjs().tz("Asia/Karachi").format("MMMM"),
            day: dayjs().tz("Asia/Karachi").format("D"),
            time: dayjs().tz("Asia/Karachi").format("h:mm A"),
            year: dayjs().tz("Asia/Karachi").format("YYYY"),
        };

        if (!userId) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else if (!filePath) {
            return res.status(400).send({ status: 400, message: "Something went wrong while uploading post" });
        }

        const userData = await User.findById(userId).select("-password -email");

        const newPost = new blogPost({
            filePath: {
                url: filePath.url,
                public_id: filePath.public_id
            },
            postTime,
            userData,
            ...req.body,
        });

        await newPost.save();

        res.status(201).send({ status: 201, message: "Post Added Successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: 500, message: "Internal Server Error" });
    }
});

postData.patch('/like-posts/:id', auth, async (req, res) => {
    try {
        const { userId } = req.userData;

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

        res.status(200).send({ status: 200, message: (likedPost ? "Post unliked" : "Post liked") });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Internal Error" })
    }
})

postData.delete("/delete-post/:id", auth, async (req, res) => {
    const id = req.params.id;
    try {

        const post = await blogPost.findOne({ _id: id });

        if (!post) {
            return res.status(404).send({ status: 404, message: "Post not found" });
        }

        await removeFileFromCloudinary(post.filePath.public_id);

        await blogPost.findByIdAndDelete({ _id: id });

        res.status(200).send({ status: 200, message: "Post Deleted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Internal Server Error" });
    }
});

postData.patch("/update-post/:id", auth, upload.single('File'), async (req, res) => {
    try {
        const id = req.params.id;

        const localFilePath = req.file?.path;

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
                url: null,
                public_id: null
            },
        };

        if (localFilePath) {

            try {
                const post = await blogPost.findById(id);

                await removeFileFromCloudinary(post.filePath.public_id);

                const filePath = await uploadFileToCloudinary(localFilePath);

                updatedData.filePath.url = filePath.url;

                updatedData.filePath.public_id = filePath.public_id;
            } catch (error) {
                console.log("Error while removing and updating image form cloudinary", error);
                throw error
            }

        }

        const postUpdated = await blogPost.findByIdAndUpdate(id, updatedData, { new: true });

        if (!postUpdated) {
            return res.status(404).send({ status: 404, message: "Post not found" })
        }

        // if (!filePath) {

        //     await blogPost.findByIdAndUpdate(id, {
        //         filePath: oldFilePath.filePath, postTime, ...req.body,
        //     }, { new: true });

        // } else {

        //     if (!oldFilePath) {
        //         return res.status(404).send({ status: 404, message: "Post not found" });
        //     }

        //     await blogPost.findByIdAndUpdate(id, {
        //         filePath: filePath.url, postTime, ...req.body,
        //     }, { new: true });

        // }

        res.status(200).send({ status: 200, message: "Updated Successfully", })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 500, message: "Internal Error" });
    }
})

export default postData;