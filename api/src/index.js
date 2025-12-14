import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import reviewRouter from "./routers/review_router.js"
import movieRouter from "./routers/movie_router.js";
import accountRouter from "./routers/account_router.js";
import groupRouter from "./routers/group_router.js";
import "./jobs/accountCleanupJob.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.REACT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/movies", movieRouter);
app.use("/group", groupRouter);
app.use("/account", accountRouter);
app.use("/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.send("Postgres API esimerkki");
});

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
