import { Router } from "express";
import { loginUser, logoutUser, registerUser, userProfile } from "../controllers/auth.controller.js";



const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/profile").post(userProfile)
router.route("/logout").post(logoutUser)

export default router