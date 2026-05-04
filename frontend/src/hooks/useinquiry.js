import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const useInquiry = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/inquiry");
            setInquiries(response.data);
        } catch (err) {
            console.error("Error fetching inquiries:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchInquiryById = useCallback(async (id) => {
        try {
            const response = await axios.get(`/api/inquiry/${id}`);
            return response.data;
        } catch (err) {
            console.error("Error fetching inquiry:", err);
            return null;
        }
    }, []);

    const createInquiry = async (inquiryData) => {
        setLoading(true);
        try {
            const response = await axios.post("/api/inquiry", inquiryData, {
                headers: { "Content-Type": "application/json" },
            });
            setInquiries((prev) => [...prev, response.data]);
            toast.success("Inquiry created successfully!");
        } catch (err) {
            console.error("Error creating inquiry:", err);
            toast.error(err?.response?.data?.message || "Error creating inquiry");
        } finally {
            setLoading(false);
        }
    };

    const updateInquiryStatus = async (id, status) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/inquiry/${id}`, { status }, {
                headers: { "Content-Type": "application/json" },
            });
            setInquiries((prev) =>
                prev.map((inquiry) =>
                    inquiry._id === id ? response.data : inquiry
                )
            );
            toast.success("Inquiry status updated successfully!");
        } catch (err) {
            console.error("Error updating inquiry status:", err);
            toast.error(err?.response?.data?.message || "Error updating inquiry status");
        } finally {
            setLoading(false);
        }
    };

    const deleteInquiry = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/inquiry/${id}`);
            setInquiries((prev) => prev.filter((inquiry) => inquiry._id !== id));
            toast.success("Inquiry deleted successfully!");
        } catch (err) {
            console.error("Error deleting inquiry:", err);
            toast.error(err?.response?.data?.message || "Error deleting inquiry");
        } finally {
            setLoading(false);
        }
    };

    return {
        inquiries,
        loading,
        fetchInquiries,
        fetchInquiryById,
        createInquiry,
        updateInquiryStatus,
        deleteInquiry,
    };
};