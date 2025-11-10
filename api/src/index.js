import express from "express";
import cors from "cors";
import "dotenv/config";

import bookRouter from "./routers/book_router.js";
import movieRouter from "./routers/movie_router.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/movies", movieRouter);
app.use("/book", bookRouter);

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
