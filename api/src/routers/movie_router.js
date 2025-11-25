import { Router } from "express";
import { search, nowplaying, getFavorites, insertFavoriteMovie } from "../controllers/movie_controller.js";
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router();

router.get("/search", search);
router.get("/nowplaying", nowplaying);

router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites", authMiddleware, insertFavoriteMovie);

export default router;