import React from 'react'
import { BrowserRouter, Router, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the default styles


import Header from './components/Header'
import Dashboard from './pages/dashboard'
import Footer from './components/Footer'
import DonorD from './pages/DonorD'
import AppointmentD from './pages/AppointmentD'
import HospitalD from './pages/HospitalD'
import HosAdEdit from './pages/HospitalAdminProfile'
import DonorLogin from './pages/DonorLogin';
import DonorSign from "./pages/DonorSign";
import AdminLogin from "./pages/AdminLogin";

import Hospital_login from'./pages/Hospital_login'
import HospitalRegister from './pages/HospitalRegister'
import EmergencyBloodRequest from'./pages/EBR'
import ReceiverLogin from './pages/ReceiverLogin'
import Campaigns from './pages/Campaigns'
import Chatbot from './pages/Chatbot'

import ContactUs from './pages/ContactUs'
import Terms from './pages/Terms'
import Home from './pages/Home'
import FAQ from './pages/FAQ'
import PrivacyPolicy from './pages/PrivacyPolicy'
import HospitalAdminLogin from'./pages/HospitalAdminLogin'
import HealthEvaluationD from './pages/HealthEvaluationD'
import Profile from './pages/Profile'

import InquiryD from './pages/InquiryD'
import FeedbackD from './pages/FeedbackD'
import EmergencyBD from './pages/EmergencyBRD'
import BloodInventoryD from './pages/BloodInventoryD'
import HospitalAdminsD from './pages/HospitalAdminsD'
import SystemManagerD from './pages/SystemManagerD'
import DonorGamification from './pages/DonorGamification'
import DonorHistory from './pages/DonorHistory'
import ReceiverRegister from './pages/ReceiverRegister'
import ReceiverDashboard from './pages/ReceiverDashboard'
import ReceiverD from './pages/ReceiverD'
import Payment from './pages/Payment'
import BackupD from './pages/BackupD'
import Language from './pages/Language'
import Reports from './pages/Reports'



function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === '/dashboard';
  return (
    <>
    {!hideHeader && <Header/>}
    <Routes>
    <Route path="/dashboard" element={<Dashboard />}/>
    <Route path="/donord" element={<DonorD />}/>
    <Route path="/hospitald" element={<HospitalD />}/>
    <Route path="/appointmentd" element={<AppointmentD />}/>
    <Route path="/adminProfile" element={<HosAdEdit />}/>
    <Route path="/donor-login" element={<DonorLogin />} />
    <Route path="/register" element={<DonorSign />} />
    <Route path="/admin-login" element={<AdminLogin />} />


    <Route path="/hospital-login" element={<Hospital_login />} />
    <Route path="/hospital-register" element={<HospitalRegister />} />
    <Route path="/receiver-login" element={<ReceiverLogin />} />
    <Route path="/receiver-register" element={<ReceiverRegister />} />
<Route path="/receiver-dashboard" element={<ReceiverDashboard />} />
    <Route path="/receiverd" element={<ReceiverD />} />
    <Route path="/EBR" element={<EmergencyBloodRequest />} />
    <Route path="/campaigns" element={<Campaigns />} />
    <Route path="/chatbot" element={<Chatbot />} />

    <Route path="/ContactUs" element={<ContactUs />} />
    <Route path="/Terms" element={<Terms />} />
    <Route path="/" element={<Home />} />
    <Route path="/FAQ" element={<FAQ />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />

    <Route path="/feedd" element={<FeedbackD/>}/>
    <Route path="/inqd" element={<InquiryD/>}/>
    <Route path="/emerbd" element={<EmergencyBD/>}/>
    <Route path="/bloodid" element={<BloodInventoryD/>}/>

    <Route path="/healthEvaluationD" element={<HealthEvaluationD />} />
    <Route path="/HospitalAdminLogin" element={<HospitalAdminLogin />} />
    <Route path="/Profile" element={<Profile/>}/>

    <Route path="/hosadd" element={<HospitalAdminsD/>}/>
    <Route path="/sysmand" element={<SystemManagerD/>}/>
    <Route path="/donorGamification" element={<DonorGamification/>}/>
    <Route path="/donorHistory" element={<DonorHistory/>}/>
    <Route path="/donate" element={<Payment/>}/>
    <Route path="/backup" element={<BackupD/>}/>
    <Route path="/language" element={<Language/>}/>
    <Route path="/reports" element={<Reports/>}/>
    </Routes>
    <Footer/>
    <ToastContainer />
    </>
  )
}



export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
