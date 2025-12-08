import fs from 'fs'
import path from 'path'
import { pool } from './db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const __dirname = import.meta.dirname

const initializeTestDb = () => {
    const sql = fs.readFileSync(path.resolve(__dirname, '../testdb.sql'), 'utf-8')

    pool.query(sql, (err) => {
        if (err) console.log('Error initializing test database:', err)
        else console.log('Test database initialized successfully')
    })
}

const insertTestUser = (user) => {
    bcrypt.hash(user.password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err)
            return
        }
        pool.query('insert into account (email, password) values ($1, $2)',
            [user.email, hashedPassword],
            (err, result) => {
                if (err) console.error('Error inserting test user:', err)
                else console.log('Test user inserted successfully')
            }
        )
    }) 
}

const getToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET)
}

export { initializeTestDb, insertTestUser, getToken }