import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useCampaign = () => {
  const [loading, setLoading] = useState(false);

  const getCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/campaign');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch campaigns');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerForCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/campaign/${campaignId}/register`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Successfully registered for campaign!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register for campaign';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const donateToCampaign = async (campaignId, donationData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/campaign/${campaignId}/donate`, donationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Donation successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Donation failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/campaign', campaignData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Campaign created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create campaign';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getCampaigns,
    registerForCampaign,
    donateToCampaign,
    createCampaign,
  };
};
