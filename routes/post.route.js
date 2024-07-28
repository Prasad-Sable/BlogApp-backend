import { Router } from "express";
import { allPost, createPost, singlePost, updatePost } from "../controllers/post.controller.js";
import multer from "multer"
const uploadMiddleware = multer({ dest: 'uploads/' });

const router = Router()

router.route("/post").post(uploadMiddleware.single('file'),createPost).put(uploadMiddleware.single('file'),updatePost).get(allPost)
router.route("/post/:id").get(singlePost)

export default router