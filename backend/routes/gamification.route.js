import express from "express";
import {
    getGamificationByDonor,
    getLeaderboard,
    getDonorBadges,
} from "../controllers/gamification.controller.js";

const router = express.Router();

router.get("/donor/:id", getGamificationByDonor);
router.get("/leaderboard", getLeaderboard);
router.get("/badges/:id", getDonorBadges);

export default router;
