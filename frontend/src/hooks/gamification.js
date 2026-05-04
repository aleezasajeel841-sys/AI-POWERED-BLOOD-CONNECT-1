import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useGamification = () => {
  const [loading, setLoading] = useState(false);

  const getGamificationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gamification', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch gamification data');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gamification/leaderboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDonorBadges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/gamification/badges', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch badges');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGamificationAfterDonation = async (donorId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/gamification/update', { donorId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update gamification');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getGamificationData,
    getLeaderboard,
    getDonorBadges,
    updateGamificationAfterDonation,
  };
};
