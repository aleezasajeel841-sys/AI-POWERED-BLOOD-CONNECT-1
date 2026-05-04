import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from './useAuthContext';

export const useDashboardData = () => {
  const { user } = useAuthContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Support both user.userObj._id and user._id (direct user object)
    const userId = user?.userObj?._id || user?._id;
    const userRole = user?.role;
    
    if (!userId || !userRole) {
      // For unauthenticated users, show general dashboard data
      const fetchGeneralData = async () => {
        try {
          const response = await axios.get(`/api/dashboard/general`);
          setData(response.data);
          setLoading(false);
        } catch (err) {
          // Set default data for guests
          setData({
            totalDonations: 0,
            totalRequests: 0,
            emergencyRequests: 0
          });
          setLoading(false);
        }
      };
      fetchGeneralData();
      return;
    }
    
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/dashboard/${userRole.toLowerCase()}`, {
          params: { userId, role: userRole },
        });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading, error };
};
