import express from 'express'
import userData from './userData.Routes.js';
import postData from './postData.Routes.js';

const mainRoute = express.Router();

mainRoute.use("/user", userData);
mainRoute.use("/post", postData);

export default mainRoute;