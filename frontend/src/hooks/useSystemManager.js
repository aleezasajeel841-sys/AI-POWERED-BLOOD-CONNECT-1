import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const useSystemManager = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchManagers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/manager");
            setManagers(response.data);
        } catch (err) {
            console.error("Error fetching managers:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchManagerById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/manager/${id}`);
            setManagers([response.data]);
        } catch (err) {
            console.error("Error fetching manager by ID:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createManager = async (formData) => {
        try {
            const response = await axios.post("/api/manager", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setManagers((prev) => [...prev, response.data]);
            toast.success("Manager created successfully!");
        } catch (err) {
            console.error("Error creating manager:", err);
            toast.error(err?.response?.data?.message || "Error creating manager");
        }
    };

    const updateManager = async (id, formData) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/manager/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setManagers((prev) =>
                prev.map((manager) =>
                    manager._id === id ? { ...manager, ...response.data } : manager
                )
            );
            toast.success("Manager updated successfully!");
        } catch (err) {
            console.error("Error updating manager:", err);
            toast.error(err?.response?.data?.message || "Error updating manager");
        } finally {
            setLoading(false);
        }
    };

    const deleteManager = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/manager/${id}`);
            setManagers((prev) => prev.filter((manager) => manager._id !== id));
            toast.success("Manager deleted successfully!");
        } catch (err) {
            console.error("Error deleting manager:", err);
            toast.error(err?.response?.data?.message || "Error deleting manager");
        } finally {
            setLoading(false);
        }
    };

    const activateDeactivateManager = async (id) => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/manager/${id}/toggle-status`);
            setManagers((prev) =>
                prev.map((manager) =>
                    manager._id === id ? { ...manager, activeStatus: !manager.activeStatus } : manager
                )
            );
            toast.success("Manager status toggled successfully!");
        } catch (err) {
            console.error("Error toggling manager status:", err);
            toast.error(err?.response?.data?.message || "Error toggling manager status");
        } finally {
            setLoading(false);
        }
    };

    return {
        managers,
        loading,
        fetchManagers,
        fetchManagerById,
        createManager,
        updateManager,
        deleteManager,
        activateDeactivateManager,
    };
};