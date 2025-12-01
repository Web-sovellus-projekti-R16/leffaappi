import express from 'express'
import { createAccount, 
        loginAccount, 
        logoutAccount, 
        refreshAccessToken,
        deleteAccount,
        getProfile,
        restoreAccount } from '../controllers/account_controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post("/register", createAccount)
router.post("/login", loginAccount)
router.post("/logout", logoutAccount)
router.post("/refresh", refreshAccessToken)

router.get("/profile", authMiddleware, getProfile)
router.put("/delete", authMiddleware, deleteAccount)

router.get("/logout", logoutAccount);
router.post("/restore", restoreAccount);

export default router