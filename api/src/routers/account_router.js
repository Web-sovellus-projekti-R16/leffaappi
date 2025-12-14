import express from 'express'
import multer from 'multer'
import { createAccount, 
        loginAccount, 
        logoutAccount, 
        refreshAccessToken,
        deleteAccount,
        getProfile,
        changePassword,
        restoreAccount,
        uploadProfileImage,
        deleteProfileImage } from '../controllers/account_controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.post("/register", createAccount)
router.post("/login", loginAccount)
router.post("/logout", logoutAccount)
router.post("/refresh", refreshAccessToken)

router.get("/profile", authMiddleware, getProfile)
router.post("/profile-image", authMiddleware, upload.single("image"), uploadProfileImage)
router.delete("/profile-image", authMiddleware, deleteProfileImage)
router.put("/password", authMiddleware, changePassword)
router.put("/delete", authMiddleware, deleteAccount)

router.get("/logout", logoutAccount);
router.post("/restore", restoreAccount);

export default router