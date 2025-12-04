import { Router } from "express";
import { search, 
    nowplaying, 
    getByTmdbId, 
    getFavorites, 
    insertFavorite,
    updateFavorite,
    removeFavorite } from "../controllers/movie_controller.js";
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router();

router.get("/search", search);
router.get("/nowplaying", nowplaying);
router.get("/tmdb", getByTmdbId);

router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites", authMiddleware, insertFavorite);
router.put("/favorites", authMiddleware, updateFavorite);
router.delete("/favorites", authMiddleware, removeFavorite);

export default router;