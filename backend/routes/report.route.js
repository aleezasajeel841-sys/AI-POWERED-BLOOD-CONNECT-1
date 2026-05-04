import express from 'express';
import { generateHealthEvaluationReport,generateHealthEvaluationReportByHospital , generateInventoryReport,generateInventoryReportByManager , generateAppointmentReport,generateSystemAdminReport,generateFeedbackReport,generateInquiryReport , generateDonorReport ,generateHospitalReport, generateEmergencyBRReport, generateHospitalAdminReport } from '../controllers/report.controller.js';

const router = express.Router();

router.get('/inventory-report', generateInventoryReport);
router.get('/healthEvaluation-report', generateHealthEvaluationReport);
router.get('/healthEvaluation-report-Hospital', generateHealthEvaluationReportByHospital);
router.get('/feedback-report', generateFeedbackReport);
router.get('/inquiry-report', generateInquiryReport);
router.get('/appointment-report', generateAppointmentReport);
router.get('/systemAdmin-report', generateSystemAdminReport);
router.get('/donor-report',generateDonorReport);
router.get('/hospital-report',generateHospitalReport);
router.get('/emergency-br-report',generateEmergencyBRReport)
router.get('/hospitalAdmin-report',generateHospitalAdminReport);
router.get('/inventory-report-Manager', generateInventoryReportByManager);

router.use('/reports', express.static('reports'));

export default router;