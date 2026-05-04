import express from "express";
import {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    registerForCampaign,
    getCampaignsByOrganizer,
    donateToCampaign,
} from "../controllers/campaign.controller.js";

const router = express.Router();

router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.post("/", createCampaign);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

// Registration and donation
router.post("/:id/register", registerForCampaign);
router.post("/:id/donate", donateToCampaign);

// Organizer-specific routes
router.get("/organizer/:organizerId/:organizerType", getCampaignsByOrganizer);

export default router;
