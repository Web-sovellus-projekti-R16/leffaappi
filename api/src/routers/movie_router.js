import { Router } from "express";
import { search, nowplaying } from "../controllers/movie_controller.js";

const router = Router();

router.get("/search", search);
router.get("/nowplaying", nowplaying);

export default router;