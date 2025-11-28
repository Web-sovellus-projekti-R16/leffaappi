import { Router } from "express";
import { search, 
    nowplaying, 
    getByTmdbId
} from "../controllers/movie_controller.js";
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router();

router.get("/search", search);
router.get("/nowplaying", nowplaying);
router.get("/tmdb", getByTmdbId);
router.get("/tmdb/:tmdb_id", getByTmdbId);

export default router;