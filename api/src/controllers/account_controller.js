import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { uploadToR2, getSignedUrlFromKey, deleteFromR2 } from '../helpers/r2Service.js'
import { insertAccount, 
        findAccountByEmail,
        updatePassword,
        findDeletedAccount,
        softDeleteAccount,
        permanentlyDeleteExpiredAccounts,
        restoreAccount as restoreAccountModelm,
    insertImage, deleteImage } from '../models/account_model.js'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const createAccount = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password is required" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await insertAccount(email, hashedPassword)
        return res.status(201).json({
            message: "Account created successfully",
            account: result.rows[0]
        })
    } catch (err) {
        console.error("Error creating account:", err)
        if (err.code === "23505") {
            return res.status(400).json({ error: "Email already exists" })
        }
        return res.status(500).json({ error: "Server error" })
    }
}

export const loginAccount = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password is required" })
        }
        
        const result = await findAccountByEmail(email)

        if (result.rowCount === 0) {
            return res.status(401).json({ error: "Invalid Email or Password" })
        }

        const account = result.rows[0]
        
        const validatePassword = await bcrypt.compare(password, account.password_hash)

        if (!validatePassword) {
            return res.status(401).json({ error: "Invalid Email or Password" })
        }

        const accessToken = jwt.sign({
            id: account.account_id,
            email: account.email
        },
            process.env.JWT_SECRET,
            { expiresIn: '1h' })

        const refreshToken = jwt.sign({
            id: account.account_id,
            email: account.email
        },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '2h' })
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        
        res.json({
            message: "Login successful",
            token: accessToken,
            account: {
                id: account.account_id,
                email: account.email
            }
        })
    } catch (err) {
        console.error("Login error:", err)
        res.status(500).json({ error: "Server error" })
    }
}

export const refreshAccessToken = (req, res) => {
    const token = req.cookies.refreshToken
    if (!token) {
        return res.status(401).json({ error: "No refresh token found" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        const newAccessToken = jwt.sign({
            id: decoded.id,
            email: decoded.email
        },
        process.env.JWT_SECRET,
            { expiresIn: '1h' })
        res.json({ token: newAccessToken })
    } catch (err) {
        res.status(401).json({ error: "Invalid refresh token" })
    }
}

export const logoutAccount = (req, res) => {
    const token = req.cookies?.refreshToken

    if (!token) {
        return res.status(401).json({ error: "Not authenticated" })
    }    
    
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        path: "/"
    })
    return res.status(200).json({ message: "Logout succesful" })
}

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        const id = req.user.id
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "Old and new password are required" })
        }

        const result = await findAccountByEmail(req.user.email)
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Account not found" })
        }

        const account = result.rows[0]
        const validateOldPass = await bcrypt.compare(oldPassword, account.password_hash)
        if (!validateOldPass) {
            return res.status(401).json({ error: "Old password didnt match" })
        }

        const newHash = await bcrypt.hash(newPassword, 10)

        const updateRes = await updatePassword(id, newHash)

        if (updateRes.rowCount === 0) {
            return res.status(500).json({ error: "Password not updated"})
        }

        return res.json({ message: "Password updated successfully" })
    } catch (err) {
        console.error("Password change error:", err)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const { confirmation } = req.body;
        const expectedPhrase = "delete-my-account";

        if (confirmation !== expectedPhrase) {
            return res.status(400).json({
                error: `Incorrect confirmation phrase. Please type: ${expectedPhrase}`
            });
        }

        const accountId = req.user.id; 
        const result = await softDeleteAccount(accountId);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.json({
            message: "Account is flagged as deleted. It will be permanently removed in 14 days."
        });

    } catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { email } = req.user

        const result = await findAccountByEmail(email)
        const account = result.rows[0]

        let signedUrl = null
        try {
            if (account.profile_image_key) {
                signedUrl = await getSignedUrlFromKey(account.profile_image_key)
            }
        } catch (err) {
            console.error("R2 signed URL error:", err)
            signedUrl = null
        }

        res.json({
            message: "Profile retrieved",
            user: { 
                id: account.account_id, 
                email: account.email,
                profile_image_url: signedUrl
            }
        })
    } catch (err) {
        console.error("Profile fetch error:", err)
        res.status(500).json({ error: "Server error" })
    }
}

export const restoreAccount = async (req, res) => {
    const { email, password } = req.body
    try {
        const accountRes = await findDeletedAccount(email)
        
        if (accountRes.rowCount === 0) {
            return res.status(404).json({ ok: false, error: "Account not found or not deleted" })
        }

        const account = accountRes.rows[0]

        const validatePassword = await bcrypt.compare(password, account.password_hash)

        if (!validatePassword) {
            return res.status(401).json({ ok: false, error: "Invalid Password" })
        }

        const restoreResult = await restoreAccountModel(account.account_id)

        if (restoreResult.rowCount === 0) {
            return res.status(500).json({ ok: false, error: "Could not restore account" })
        }

        const accessToken = jwt.sign(
            { id: account.account_id, email: account.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        const refreshToken = jwt.sign(
            { id: account.account_id, email: account.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "2h" }
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            ok: true,
            message: "Account restored",
            token: accessToken,
            account: {
                id: account.account_id,
                email: account.email
            }
        })
    } catch (err) {
        console.error("Account restore error:", err)
        res.status(500).json({ error: "Server error" })
    }
}

export const uploadProfileImage = async (req, res) => {
    try {
        const accountId = req.user.id

        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" })
        }

        const file = req.file
        const timestamp = Date.now()
        const ext = file.originalname.split('.').pop()
        const fileName = `profile-${accountId}-${timestamp}.${ext}`

        const { key, signedUrl } = await uploadToR2(file.buffer, fileName, file.mimetype)

        await insertImage(accountId, key)

        return res.status(201).json({
            message: "Profile image uploaded successfully",
            imageUrl: signedUrl
        })
    } catch (err) {
        console.error("Profile image upload error:", err)
        res.status(500).json({ error: "Server error" })
    }
}

export const deleteProfileImage = async (req, res) => {
    try {
        const accountId = req.user.id

        const imageKey = await deleteImage(accountId)

        if (imageKey) {
            await deleteFromR2(imageKey)
        }

        res.status(200).json({ message: "Profile image deleted" })
    } catch (err) {
        console.error("Delete profile image error:", err)
        res.status(500).json({ error: "Server error" })
    }
}