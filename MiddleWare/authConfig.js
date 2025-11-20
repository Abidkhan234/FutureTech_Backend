import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../Schema/userSchema.js";

const auth = async (req, res, next) => {
  try {
    const headers = req.headers["authorization"];

    if (!headers) {
      return res.status(401).send({ status: 401, message: "Login In First" });
    } else {
      const token = headers?.split(" ")[1];

      const userData = jwt.verify(token, process.env.SECERET_KEY);

      const user = await User.findById(userData.userId);

      if (!user) {
        return res.status(404).send({ status: 404, message: "User not found" });
      }

      req.userData = user;

      next();
    }
  } catch (error) {
    console.log(error);
    if (
      error.message.includes("jwt expired") ||
      error.message.includes("invalid token")
    ) {
      return res.status(401).send({ status: 401, message: "Token expired" });
    }
    return res.status(500).send({ status: 500, message: "Internal Error" });
  }
};

export default auth;
