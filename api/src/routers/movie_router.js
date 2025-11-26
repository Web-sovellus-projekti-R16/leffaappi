import { Router } from "express";
import { search, 
    nowplaying, 
    getByTmdbId, 
    getFavorites, 
    insertFavoriteMovie,
    removeFavoriteMovie } from "../controllers/movie_controller.js";
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router();

router.get("/search", search);
router.get("/nowplaying", nowplaying);
router.get("/tmdb", getByTmdbId);

router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites", authMiddleware, insertFavoriteMovie);
router.delete("/favorites", authMiddleware, removeFavoriteMovie);

export default router;