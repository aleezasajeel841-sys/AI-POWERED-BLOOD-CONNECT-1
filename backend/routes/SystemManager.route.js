import express from "express";
import upload from '../utils/multer.js';
import {
    getSystemManagers,
    getSystemManagerById,
    createSystemManager,
    updateSystemManager,
    deleteSystemManager,
    activateDeactivateSystemManager
} from "../controllers/SystemManager.controller.js";

const router = express.Router();

router.get("/", getSystemManagers);          // Get all system managers
router.get("/:id", getSystemManagerById);    // Get a single system manager by ID
router.post("/", upload.single('image'), createSystemManager);       // Create a new system manager
router.put("/:id", upload.single('image'), updateSystemManager);     // Update an existing system manager
router.delete("/:id", deleteSystemManager);  // Delete a system manager
router.patch('/:id/toggle-status', activateDeactivateSystemManager); // New route

export default router;