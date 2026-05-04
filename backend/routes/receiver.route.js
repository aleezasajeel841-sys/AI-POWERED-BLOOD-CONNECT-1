import express from "express";
import {
    getReceivers,
    getReceiverById,
    createReceiver,
    updateReceiver,
    deleteReceiver,
    activateDeactivateReceiver,
    createBloodRequest,
    getBloodRequestsByReceiver,
    searchDonors,
} from "../controllers/receiver.controller.js";

const router = express.Router();

router.get("/", getReceivers);
router.get("/:id", getReceiverById);
router.post("/", createReceiver);
router.put("/:id", updateReceiver);
router.delete("/:id", deleteReceiver);
router.patch("/:id/toggle-status", activateDeactivateReceiver);

// Blood request routes
router.post("/:id/blood-request", createBloodRequest);
router.get("/:id/blood-requests", getBloodRequestsByReceiver);

// Search routes
router.get("/search/donors", searchDonors);

export default router;
