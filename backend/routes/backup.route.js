import express from "express";
import {
    getBackups,
    createBackup,
    downloadBackup,
    deleteBackup,
} from "../controllers/backup.controller.js";

const router = express.Router();

router.get("/", getBackups);
router.post("/", createBackup);
router.get("/:id/download", downloadBackup);
router.delete("/:id", deleteBackup);

export default router;
