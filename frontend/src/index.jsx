import express from 'express'
import cors from 'cors'
import movieRouter from './routers/movie_router.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

app.use("/movies", movieRouter);

app.listen(import.meta.env.VITE_API_PORT, () => {
    console.log(`Server is running on ${import.meta.env.VITE_API_URL}`)
})