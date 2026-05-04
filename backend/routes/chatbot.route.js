import express from "express";
import {
    getChatbotResponse,
    getChatHistory,
    getChatbotAnalytics,
} from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chat", getChatbotResponse);
router.get("/history", getChatHistory);
router.get("/analytics", getChatbotAnalytics);

export default router;
