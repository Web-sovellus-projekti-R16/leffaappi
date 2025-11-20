import express from 'express'
import { createAccount, loginAccount, logoutAccount, refreshAccessToken } from '../controllers/account_controller.js'

const router = express.Router()

router.post("/register", createAccount)
router.post("/login", loginAccount)
router.post("/logout", logoutAccount)
router.post("/refresh", refreshAccessToken)

export default router