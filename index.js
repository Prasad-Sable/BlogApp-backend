import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import connectDB from "./db/dbConfig.js"
import authRoute from "./routes/auth.route.js"
import postRoute from "./routes/post.route.js"
import dotenv from "dotenv"

dotenv.config("./.env")

const app = express();


app.use(cors({credentials:true,origin:process.env.CLIENT_URL}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads",express.static("uploads"))

app.use("/api/v1/auth",authRoute)
app.use("/api/v1/post",postRoute)



connectDB()

app.listen(4000);
