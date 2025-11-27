import express from "express"
import { addReview, editReview, removeReview, movieReviews } from "../controllers/review_controller.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/movie/:movie_id", movieReviews)
router.post("/", authMiddleware, addReview)
router.put("/:id", authMiddleware, editReview)
router.delete("/:id", authMiddleware, removeReview)

export default router
