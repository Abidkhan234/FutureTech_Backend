import mongoose from "../DB/index.js";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatarPath: {
        type: String,
    }
});

const User = mongoose.model("users", userSchema);

export default User;