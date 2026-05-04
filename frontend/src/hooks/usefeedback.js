import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const useFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFeedbacks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/feedback");
            setFeedbacks(response.data);
            
        } catch (err) {
            console.error("Error fetching feedbacks:", err);
           
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFeedbackById = useCallback(async (id) => {
        try {
            const response = await axios.get(`/api/feedback/${id}`);
            return response.data;
            
        } catch (err) {
            console.error("Error fetching feedback:", err);
            return null;
        }
    }, []);

    const createFeedback = useCallback(async (feedbackData) => {
        setLoading(true);
        try {
            const response = await axios.post("/api/feedback", feedbackData, {
                headers: { "Content-Type": "application/json" },
            });
            setFeedbacks((prev) => [...prev, response.data]);
            toast.success("Feedback created successfully!");
        } catch (err) {
            console.error("Error creating feedback:", err);
            toast.error(err?.response?.data?.message || "Error creating feedback");
        } finally {
            setLoading(false);
        }
    }, []);

    const updateFeedback = useCallback(async (id, feedbackData) => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/feedback/${id}`, feedbackData, {
                headers: { "Content-Type": "application/json" },
            });
            setFeedbacks((prev) =>
                prev.map((feedback) => (feedback._id === id ? response.data : feedback))
            );
            toast.success("Feedback updated successfully!");
        } catch (err) {
            console.error("Error updating feedback:", err);
            toast.error(err?.response?.data?.message || "Error updating feedback");
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteFeedback = useCallback(async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/feedback/${id}`);
            setFeedbacks((prev) => prev.filter((feedback) => feedback._id !== id));
            toast.success("Feedback deleted successfully!");
        } catch (err) {
            console.error("Error deleting feedback:", err);
            toast.error(err?.response?.data?.message || "Error deleting feedback");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        feedbacks,
        loading,
        fetchFeedbacks,
        fetchFeedbackById,
        createFeedback,
        updateFeedback,
        deleteFeedback,
    };
};