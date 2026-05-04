import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);

  const createPayment = async (paymentData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/payment', paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Payment initiated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Payment failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payment', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch payments');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId, status) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/payment/${paymentId}/status`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Payment status updated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update payment status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (paymentId, amount) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/payment/${paymentId}/refund`, { amount }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Refund processed successfully!');
      return response.data;
    } catch (error) {
      toast.error('Refund failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPayment,
    getPayments,
    updatePaymentStatus,
    refundPayment,
  };
};
