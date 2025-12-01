import express from "express"
import { addReview, editReview, removeReview, movieReviews, userReviews
 } from "../controllers/review_controller.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/movie/tmdb/:tmdb_id", movieReviews)
router.post("/upsert", authMiddleware, addReview)
router.get("/account", authMiddleware, userReviews)
router.put("/:id", authMiddleware, editReview)
router.delete("/:review_id", authMiddleware, removeReview)

export default router
