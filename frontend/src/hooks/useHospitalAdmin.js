import { useCallback, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useHospitalAdmin = () => {
    const [hospitalAdmins, setHospitalAdmins] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHospitalAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/healthAd');
            setHospitalAdmins(response.data);
        } catch (err) {
            console.error("Error fetching hospital admins:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHospitalAdminsByHospitalId = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/healthAd/hospital/${id}`);
            setHospitalAdmins(response.data);
        } catch (err) {
            console.error("Error fetching hospital admins by hospital ID:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHospitalAdminById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/healthAd/${id}`);
            setHospitalAdmins([response.data]);
        } catch (err) {
            console.error("Error fetching hospital admin by ID:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createHospitalAdmin = async (formData) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/healthAd', formData);
            setHospitalAdmins(prevAdmins => [...prevAdmins, response.data]);
            toast.success('Hospital Admin created successfully!');
        } catch (err) {
            console.error("Error creating hospital admin:", err);
            toast.error(err?.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const updateHospitalAdmin = async (id, formData) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/healthAd/${id}`, formData);
            setHospitalAdmins(prevAdmins =>
                prevAdmins.map(admin => (admin._id === id ? response.data : admin))
            );
            toast.success('Hospital Admin updated successfully!');
        } catch (err) {
            console.error("Error updating hospital admin:", err);
            toast.error(err?.response?.data?.message || 'Failed to update admin');
        } finally {
            setLoading(false);
        }
    };

    const deleteHospitalAdmin = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/healthAd/${id}`);
            setHospitalAdmins(prevAdmins => prevAdmins.filter(admin => admin._id !== id));
            toast.success('Hospital Admin deleted successfully!');
        } catch (err) {
            console.error("Error deleting hospital admin:", err);
            toast.error(err?.response?.data?.message || 'Failed to delete admin');
        } finally {
            setLoading(false);
        }
    };

    const activateDeactivateHospitalAdmin = async (id) => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/healthAd/${id}/toggle-status`);
            setHospitalAdmins(prevAdmins =>
                prevAdmins.map(admin =>
                    admin._id === id ? { ...admin, activeStatus: !admin.activeStatus } : admin
                )
            );
            toast.success('Hospital Admin status toggled successfully!');
        } catch (err) {
            console.error("Error toggling hospital admin status:", err);
            toast.error(err?.response?.data?.message || 'Failed to toggle hospital admin status');
        } finally {
            setLoading(false);
        }
    };

    return {
        hospitalAdmins,
        loading,
        fetchHospitalAdmins,
        fetchHospitalAdminById,
        fetchHospitalAdminsByHospitalId,
        createHospitalAdmin,
        updateHospitalAdmin,
        deleteHospitalAdmin,
        activateDeactivateHospitalAdmin
    };
};