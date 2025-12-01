import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import reviewRouter from "./routers/review_router.js"

import movieRouter from "./routers/movie_router.js";
import accountRouter from "./routers/account_router.js";
import groupRouter from "./routers/group_router.js";


console.log("JWT_SECRET at boot:", process.env.JWT_SECRET);

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/movies", movieRouter);
app.use("/group", groupRouter);
app.use("/account", accountRouter);

app.use("/reviews", reviewRouter)

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});
