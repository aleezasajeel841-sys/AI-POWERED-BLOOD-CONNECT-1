import express from 'express';
import { 
  donorSocialLogin, 
  hospitalSocialLogin, 
  adminSocialLogin, 
  hospitalAdminSocialLogin,
  receiverSocialLogin
} from '../controllers/socialAuth.controller.js';

const router = express.Router();

// Social login routes
router.post('/donor', donorSocialLogin);
router.post('/hospital', hospitalSocialLogin);
router.post('/admin', adminSocialLogin);
router.post('/hospital-admin', hospitalAdminSocialLogin);
router.post('/receiver', receiverSocialLogin);

export default router;