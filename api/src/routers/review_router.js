import express from "express"
import { addReview, editReview, removeReview, movieReviews, userReviews, setFavorite} from "../controllers/review_controller.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createShareList, getSharedList } from "../controllers/share_controller.js"


const router = express.Router()

router.get("/movie/tmdb/:tmdb_id", movieReviews)
router.post("/upsert", authMiddleware, addReview)
router.get("/account", authMiddleware, userReviews)
router.put("/:id", authMiddleware, editReview)
router.delete("/:review_id", authMiddleware, removeReview)
router.post("/favorite", authMiddleware, setFavorite)
router.post("/share", authMiddleware, createShareList)
router.get("/share/:id", getSharedList)



export default router
