import fs from 'fs'
import path from 'path'
import { pool } from './db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const __dirname = import.meta.dirname

export const initializeTestDb = () => {
    return new Promise((resolve, reject) => {
        const sql = fs.readFileSync(path.resolve(__dirname, '../testdb.sql'), 'utf-8')
    
        pool.query(sql, err => {
            if (err) {
                console.log('Error initializing test database:', err)
                reject(err)
            }
            else {
                console.log('Test database initialized successfully')
                resolve()
            }
        })

    })
}

export const insertTestUser = (user) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(user.password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err)
                return reject(err)
            }
            pool.query('insert into account (email, password_hash) values ($1, $2)',
                [user.email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting test user:', err)
                        return reject(err)    
                    }
                    resolve(result.rows[0])
                }
            )
        }) 
    })
}

const getToken = (user) => {
    return jwt.sign(
        { id: user.account_id, email: user.email }, 
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    )
}