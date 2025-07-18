import express from 'express'
import cors from 'cors'
import mainRoute from './Routes/mainRoute.js'
import mongoose from './DB/index.js';

const app = express();

const port = 3000;

const db = mongoose.connection;

db.on("Error", (error) => {
    console.log("DB Error", error);
})

db.once("open", () => {
    console.log("DB Connected");
})

app.use(cors());

app.use('/api', express.static('Public'));

app.use(express.urlencoded({ extended: false, }));
app.use(express.json());

app.use("/api", mainRoute);

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})