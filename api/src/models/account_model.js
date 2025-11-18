import { pool } from '../helpers/db.js'

export const insertAccount = async (email, hashedPassword) => {
    return await pool.query('INSERT INTO account (email, password_hash) VALUES ($1, $2) RETURNING *', [email, hashedPassword])
}

export const findAccountByEmail = async (email) => {
    return await pool.query('SELECT * FROM account WHERE email = $1', [email])
}