import express from "express";
import {
    getFeedbacks,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback
} from "../controllers/feedback.controller.js";

const router = express.Router();

// ✅ Get all feedbacks
router.get("/", getFeedbacks);

// ✅ Get a single feedback by ID
router.get("/:id", getFeedbackById);

// ✅ Create new feedback
router.post("/", createFeedback);

// ✅ Update feedback (Partial Update)
router.patch("/:id", updateFeedback);

// ✅ Delete feedback
router.delete("/:id", deleteFeedback);

export default router;
