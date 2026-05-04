import Donor from '../models/donor.model.js';
import Hospital from '../models/hospital.model.js';
import SystemManager from '../models/SystemManager.model.js';
import HospitalAdmin from '../models/HospitalAdmin.model.js';
import createToken from '../utils/token.js';
import axios from 'axios';

// Helper function to verify Google token
const verifyGoogleToken = async (token) => {
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
};

// Helper function to verify Facebook token
const verifyFacebookToken = async (token, userId) => {
  try {
    const response = await axios.get(`https://graph.facebook.com/v18.0/${userId}?fields=id,name,email&access_token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying Facebook token:', error);
    throw new Error('Invalid Facebook token');
  }
};

// Donor social login
export const donorSocialLogin = async (req, res) => {
  const { provider, token, userId } = req.body;
  
  try {
    let userData;
    
    if (provider === 'google') {
      userData = await verifyGoogleToken(token);
    } else if (provider === 'facebook') {
      userData = await verifyFacebookToken(token, userId);
    } else {
      return res.status(400).json({ message: 'Unsupported social login provider' });
    }
    
    // Check if user exists
    let user = await Donor.findOne({ where: { email: userData.email } });
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = await Donor.create({
        email: userData.email,
        name: userData.name,
        password: Math.random().toString(36).slice(-10), // Generate random password
        socialProvider: provider,
        socialId: userData.sub || userData.id,
        activeStatus: true,
        // Set default values for required fields
        phoneNumber: '0000000000', // Placeholder
        dateOfBirth: new Date('2000-01-01'), // Placeholder
        bloodType: 'Unknown',
        address: 'Please update your address'
      });
    }
    
    const role = 'Donor';
    const token = createToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    
    res.status(200).json({ token, userObj, role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hospital social login
export const hospitalSocialLogin = async (req, res) => {
  const { provider, token, userId } = req.body;
  
  try {
    let userData;
    
    if (provider === 'google') {
      userData = await verifyGoogleToken(token);
    } else if (provider === 'facebook') {
      userData = await verifyFacebookToken(token, userId);
    } else {
      return res.status(400).json({ message: 'Unsupported social login provider' });
    }
    
    // Check if hospital exists
    let hospital = await Hospital.findOne({ where: { email: userData.email } });
    
    // If hospital doesn't exist, create a new one
    if (!hospital) {
      hospital = await Hospital.create({
        email: userData.email,
        name: userData.name || 'Hospital Name',
        password: Math.random().toString(36).slice(-10), // Generate random password
        socialProvider: provider,
        socialId: userData.sub || userData.id,
        activeStatus: true,
        // Set default values for required fields
        phoneNumber: '0000000000', // Placeholder
        address: 'Please update your address',
        licenseNumber: 'Please update your license'
      });
    }
    
    const role = 'Hospital';
    const token = createToken(hospital._id);
    const userObj = hospital.toObject();
    delete userObj.password;
    
    res.status(200).json({ token, userObj, role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin social login
export const adminSocialLogin = async (req, res) => {
  const { provider, token, userId } = req.body;
  
  try {
    let userData;
    
    if (provider === 'google') {
      userData = await verifyGoogleToken(token);
    } else if (provider === 'facebook') {
      userData = await verifyFacebookToken(token, userId);
    } else {
      return res.status(400).json({ message: 'Unsupported social login provider' });
    }
    
    // For security reasons, we'll only allow existing admins to login with social
    const admin = await SystemManager.findOne({ where: { email: userData.email } });
    
    if (!admin) {
      return res.status(403).json({ message: 'No admin account found with this email' });
    }
    
    const role = 'Manager';
    const token = createToken(admin._id);
    const userObj = admin.toObject();
    delete userObj.password;
    
    res.status(200).json({ token, userObj, role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hospital Admin social login
export const hospitalAdminSocialLogin = async (req, res) => {
  const { provider, token, userId } = req.body;
  
  try {
    let userData;
    
    if (provider === 'google') {
      userData = await verifyGoogleToken(token);
    } else if (provider === 'facebook') {
      userData = await verifyFacebookToken(token, userId);
    } else {
      return res.status(400).json({ message: 'Unsupported social login provider' });
    }
    
    // Check if hospital admin exists
    let admin = await HospitalAdmin.findOne({ where: { email: userData.email } });
    
    if (!admin) {
      return res.status(403).json({ message: 'No hospital admin account found with this email' });
    }
    
    const role = 'HospitalAdmin';
    const token = createToken(admin._id);
    const userObj = admin.toObject();
    delete userObj.password;
    
    res.status(200).json({ token, userObj, role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Receiver social login
export const receiverSocialLogin = async (req, res) => {
  const { provider, token, userId } = req.body;
  
  try {
    let userData;
    
    if (provider === 'google') {
      userData = await verifyGoogleToken(token);
    } else if (provider === 'facebook') {
      userData = await verifyFacebookToken(token, userId);
    } else {
      return res.status(400).json({ message: 'Unsupported social login provider' });
    }
    
    // Check if receiver exists in your database
    let receiver = await Receiver.findOne({ where: { email: userData.email } });
    
    // If receiver doesn't exist, create a new one
    if (!receiver) {
      receiver = await Receiver.create({
        email: userData.email,
        name: userData.name,
        password: Math.random().toString(36).slice(-10), // Generate random password
        socialProvider: provider,
        socialId: userData.sub || userData.id,
        activeStatus: true,
        // Set default values for required fields
        phoneNumber: '0000000000', // Placeholder
        address: 'Please update your address'
      });
    }
    
    const token = createToken(receiver._id);
    
    res.status(200).json({ 
      token, 
      receiver: {
        ...receiver.toObject(),
        role: 'Receiver'
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};