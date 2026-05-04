import express from "express";
import {
    getBloodInventory,
    getBloodInventoryById,
    createBloodInventory,
    updateBloodInventory,
    deleteBloodInventory,
    getBloodInventoryByHospital,
    toggleExpired
} from "../controllers/BloodInventory.controller.js";

const router = express.Router();

router.get("/", getBloodInventory); // Get all blood inventory records
router.get("/:id", getBloodInventoryById); // Get a single record by ID
router.get("/hospital/:id", getBloodInventoryByHospital); // Get all records by Hospital ID
router.post("/", createBloodInventory); // Create a new record
router.patch("/:id", updateBloodInventory); // Update a record
router.delete("/:id", deleteBloodInventory); // Delete a record
router.patch("/toggle-expired/:id", toggleExpired); // Toggle expired status

export default router;