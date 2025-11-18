import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { insertAccount, findAccountByEmail } from '../models/account_model.js'

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

        const token = jwt.sign({
            email: account.email
        },
        process.env.JWT_SECRET)
        
        res.json({
            message: "Login successful",
            token,
            account: {
                email: account.email
            }
        })
    } catch (err) {
        console.error("Login error:", err)
        res.status(500).json({ error: "Server error" })
    }
}