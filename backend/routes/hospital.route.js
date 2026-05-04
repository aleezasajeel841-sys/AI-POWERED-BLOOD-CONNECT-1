import express from "express";
import upload from "../utils/Multer.js"; // Assuming you have multer setup for image uploads
import {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    toggleHospitalStatus,
} from "../controllers/hospital.controller.js";

const router = express.Router();

router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.post("/", upload.single("image"), createHospital);
router.put("/:id", upload.single("image"), updateHospital);
router.delete("/:id", deleteHospital);
router.patch("/:id/toggle-status", toggleHospitalStatus);

export default router;