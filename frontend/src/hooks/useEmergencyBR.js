import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const useEmergencyBR = () => {
    const [emergencyRequests, setEmergencyRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEmergencyRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/emergency-requests");
            setEmergencyRequests(response.data);
        } catch (err) {
            console.error("Error fetching emergency requests:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEmergencyRequestById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/emergency-requests/${id}`);
            return response.data;
        } catch (err) {
            console.error("Error fetching emergency request:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createEmergencyRequest = async (requestData, proofDocumentFile) => {
        try {
            const formData = new FormData();
            Object.keys(requestData).forEach((key) => {
                formData.append(key, requestData[key]);
            });
            if (proofDocumentFile) {
                formData.append("proofDocument", proofDocumentFile);
            }

            const response = await axios.post("/api/emergency-requests", formData);
            setEmergencyRequests((prev) => [...prev, response.data]);
            toast.success("Emergency request created successfully!");
            return response.data;
        } catch (err) {
            console.error("Error creating emergency request:", err);
            toast.error(err?.response?.data?.message || "Failed to create emergency request");
            return null;
        }
    };

    const deleteEmergencyRequest = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/emergency-requests/${id}`);
            setEmergencyRequests((prev) => prev.filter((request) => request._id !== id));
            toast.success("Emergency request deleted successfully!");
        } catch (err) {
            console.error("Error deleting emergency request:", err);
            toast.error(err?.response?.data?.message || "Failed to delete emergency request");
        } finally {
            setLoading(false);
        }
    };

    const validateEmergencyRequest = async (id) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/emergency-requests/${id}/validate`);
            const updatedRequest = response.data;
            setEmergencyRequests((prev) =>
                prev.map((request) => (request._id === id ? updatedRequest : request))
            );
            toast.success("Emergency request validated successfully!");
        } catch (err) {
            console.error("Error validating emergency request:", err);
            toast.error(err?.response?.data?.message || "Failed to validate emergency request");
        } finally {
            setLoading(false);
        }
    };

    const acceptEmergencyRequest = async (id, acceptedBy, acceptedByType) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/emergency-requests/${id}/accept`, {
                acceptedBy,
                acceptedByType,
            });
            const updatedRequest = response.data;
            setEmergencyRequests((prev) =>
                prev.map((request) => (request._id === id ? updatedRequest : request))
            );
            toast.success("Emergency request accepted successfully!");
        } catch (err) {
            console.error("Error accepting emergency request:", err);
            toast.error(err?.response?.data?.message || "Failed to accept emergency request");
        } finally {
            setLoading(false);
        }
    };

    const declineEmergencyRequest = async (id, declineReason) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/emergency-requests/${id}/decline`, {
                declineReason,
            });
            const updatedRequest = response.data;
            setEmergencyRequests((prev) =>
                prev.map((request) => (request._id === id ? updatedRequest : request))
            );
            toast.success("Emergency request declined successfully!");
        } catch (err) {
            console.error("Error declining emergency request:", err);
            toast.error(err?.response?.data?.message || "Failed to decline emergency request");
        } finally {
            setLoading(false);
        }
    };

    return {
        emergencyRequests,
        loading,
        fetchEmergencyRequests,
        fetchEmergencyRequestById,
        createEmergencyRequest,
        deleteEmergencyRequest,
        validateEmergencyRequest,
        acceptEmergencyRequest,
        declineEmergencyRequest,
    };
};