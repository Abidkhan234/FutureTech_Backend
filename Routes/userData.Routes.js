import express from 'express'
import User from '../Schema/userSchema.js';
import upload from '../MiddleWare/MulterConfig.js'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { uploadFileToCloudinary } from '../Utils/Cloudinary.js';

const userData = express.Router();

userData.post("/register", upload.single('avatar'), async (req, res) => {

    const { email, password, userName } = req.body;

    const localFilePath = req.file?.path;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).send({ status: 409, message: "Email already exists" });
        }

        const avatarPath = await uploadFileToCloudinary(localFilePath);

        const hashPassword = bcrypt.hashSync(password, 10);

        const saveUser = new User({
            userName,
            email,
            password: hashPassword,
            avatarPath: avatarPath?.url,
        });

        await saveUser.save();

        res.status(201).send({ status: 201, message: "Account created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: error.message });
    }

})

userData.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }

        const isValid = bcrypt.compareSync(password, user.password);

        if (!isValid) {
            return res.status(401).send({ status: 401, message: "Invalid Password" });
        }

        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            avatarpath: user.avatarPath
        }, process.env.SECERET_KEY, { expiresIn: '5h' });

        return res.status(200).send({ status: 200, message: "Logged In Successfull", token });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 500, message: "Internal Error" });
    }
})

userData.post("/logout", async (req, res) => {
    res.status(200).send({ status: 200, message: "Logout Successfull" })
})

export default userData;