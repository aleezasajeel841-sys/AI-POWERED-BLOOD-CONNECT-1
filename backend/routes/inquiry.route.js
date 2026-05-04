// routes/inquiryRoutes.js
import express from 'express';
import {
    getAllInquiries,
    getInquiryById,
    createInquiry,
    updateInquiryStatus,
    deleteInquiry
} from '../controllers/inquiry.controller.js';

const router = express.Router();

// Get all inquiries
router.get("/", getAllInquiries);

// Get a specific inquiry by ID
router.get("/:id", getInquiryById);

// Create a new inquiry
router.post("/", createInquiry);

// Update inquiry status
router.put("/:id", updateInquiryStatus);

// Delete an inquiry by ID
router.delete("/:id", deleteInquiry);

export default router;
