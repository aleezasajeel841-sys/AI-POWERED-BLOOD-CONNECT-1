import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FaGoogle, FaInstagram } from 'react-icons/fa';
import { Button } from 'flowbite-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SocialLogin = ({ onLoginSuccess, userType }) => {
  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the token to your backend
      const response = await axios.post(`/api/social-auth/${userType}`, {
        provider: 'google',
        token: credentialResponse.credential,
      });
      
      onLoginSuccess(response.data);
      toast.success('Google login successful!');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  // Handle Instagram login (redirects to Instagram auth page)
  const handleInstagramLogin = () => {
    // This is a simplified approach - in a real app, you'd use proper OAuth flow
    window.location.href = `/api/social-auth/${userType}/instagram`;
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-center">
        <div className="border-t border-gray-300 flex-grow mr-3"></div>
        <span className="text-sm text-gray-500">or continue with</span>
        <div className="border-t border-gray-300 flex-grow ml-3"></div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google login failed')}
          useOneTap
          shape="pill"
          theme="filled_blue"
          text="continue_with"
          locale="en"
        />
        
        <Button
          onClick={handleInstagramLogin}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-medium rounded-lg px-4 py-2 flex items-center justify-center"
        >
          <FaInstagram className="mr-2" /> Instagram
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;