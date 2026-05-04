import express from "express";
import {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointmentDateTime,
    cancelAppointment,
    acceptAppointment,
    arrivedForAppointment,
    completeAppointment,
    deleteAppointment,
    cancelAppointmentDonor,
    getBloodDonationAppointmentByDonorId,
    getBloodDonationAppointmentByHospitalId
} from "../controllers/BloodDonationAppointment.controller.js";

const router = express.Router();

router.get("/hospital/:id", getBloodDonationAppointmentByHospitalId);
router.get("/donor/:id", getBloodDonationAppointmentByDonorId);
router.get("/", getAppointments); // Get all blood donation appointments
router.get("/:id", getAppointmentById); // Get a single blood donation appointment by ID
router.post("/", createAppointment); // Create a new blood donation appointment
router.patch("/:id/date-time", updateAppointmentDateTime); // Update blood donation appointment details
router.patch("/:id/cancel", cancelAppointment); 
router.patch("/:id/accept", acceptAppointment);
router.patch("/:id/arrived", arrivedForAppointment);
router.patch("/:id/complete", completeAppointment);
router.patch("/:id/cancelD", cancelAppointmentDonor);
router.delete("/:id", deleteAppointment); // Delete a blood donation appointment

export default router;