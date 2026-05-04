import express from "express";
import {
    getPayments,
    getPaymentById,
    createPayment,
    updatePaymentStatus,
    getPaymentsByUser,
    getPaymentsByCampaign,
    refundPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.patch("/:id/status", updatePaymentStatus);
router.patch("/:id/refund", refundPayment);

// User-specific routes
router.get("/user/:userId/:userType", getPaymentsByUser);

// Campaign-specific routes
router.get("/campaign/:id", getPaymentsByCampaign);

export default router;
