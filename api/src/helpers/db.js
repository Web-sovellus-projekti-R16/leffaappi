import pkg from 'pg'
import dotenv from 'dotenv'

const dbHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'db' : 'localhost')
if (process.env.NODE_ENV === "production") {
    dotenv.config()
} else if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: ".env.test" })
} 

const { Pool } = pkg

const openDb = () => {
    const pool = new Pool({
        user:  process.env.DB_USER,
        host: dbHost,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })
    return pool
}

const pool = openDb()

export { pool }