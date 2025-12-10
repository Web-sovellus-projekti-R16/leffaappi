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
    const pool = new Pool(
        process.env.NODE_ENV === "production" 
            ? {
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            }
            : {
                user: process.env.DB_USER,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD,
                port: process.env.DB_PORT
            })
    return pool
}

const pool = openDb()

export { pool }