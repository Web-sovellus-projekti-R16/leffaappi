import { pool } from '../helpers/db.js'

export const insertAccount = async (email, hashedPassword) => {
    return await pool.query('INSERT INTO account (email, password_hash) VALUES ($1, $2) RETURNING *', [email, hashedPassword])
}

export const findAccountByEmail = async (email) => {
    const query = `
        SELECT * FROM account 
        WHERE email = $1`
    return await pool.query(query, [email])
}

export const findDeletedAccount = async (email) => {
    return await pool.query(`
        SELECT account_id, password_hash
        FROM account
        WHERE email = $1 AND is_deleted = TRUE`, [email])
}

export const softDeleteAccount = async (accountId) => {
    const query = `
        UPDATE account
        SET is_deleted = true,
            account_removed = CURRENT_DATE
        WHERE account_id = $1
        RETURNING *;`
    return await pool.query(query, [accountId])
}

export const hardDeleteAccount = async (accountId) => {
    const query = `
        DELETE FROM account
        WHERE account_id = $1;`
    return await pool.query(query, [accountId])
}

export const permanentlyDeleteExpiredAccounts = async () => {
    const query = `
        DELETE FROM account
        WHERE is_deleted = true
        AND account_removed <= CURRENT_DATE - INTERVAL '14 days';`
    return await pool.query(query)
}

export const restoreAccount = async (accountId) => {
    return await pool.query(`
        UPDATE account
        SET is_deleted = FALSE, account_removed = NULL
        WHERE account_id = $1 AND is_deleted = TRUE
        RETURNING account_id, email, password_hash`, [accountId])
}