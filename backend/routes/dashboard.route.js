import express from 'express';
import { getDonorData, getHospitalData, getManagerData, getGeneralData } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/donor', getDonorData);
router.get('/hospital', getHospitalData);
router.get('/manager', getManagerData);
router.get('/general', getGeneralData);

export default router;
