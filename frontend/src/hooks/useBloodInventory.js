import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const useBloodInventory = () => {
    const [bloodInventory, setBloodInventory] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBloodInventory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/blood-inventory");
            setBloodInventory(response.data);
            
        } catch (err) {
            console.error("Error fetching blood inventory records:", err);
            
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBloodInventoryByHospital = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/blood-inventory/hospital/${id}`);
            setBloodInventory(response.data);
            toast.success("Blood inventory records by hospital fetched successfully!");
        } catch (err) {
            console.error("Error fetching blood inventory records by hospital:", err);
            toast.error(err?.response?.data?.message || "Failed to fetch blood inventory records");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBloodInventoryById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/blood-inventory/${id}`);
            
            return response.data;
        } catch (err) {
            console.error("Error fetching blood inventory record:", err);
            
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createBloodInventory = async (inventoryData) => {
        setLoading(true);
        try {
            const response = await axios.post("/api/blood-inventory", inventoryData);
            setBloodInventory((prev) => [...prev, response.data]);
            toast.success("Blood inventory record created successfully!");
        } catch (err) {
            console.error("Error creating blood inventory record:", err);
            toast.error(err?.response?.data?.message || "Failed to create blood inventory record");
        } finally {
            setLoading(false);
        }
    };

    const updateBloodInventory = async (id, inventoryData) => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/blood-inventory/${id}`, inventoryData);
            setBloodInventory((prev) =>
                prev.map((record) => (record._id === id ? response.data : record))
            );
            toast.success("Blood inventory record updated successfully!");
        } catch (err) {
            console.error("Error updating blood inventory record:", err);
            toast.error(err?.response?.data?.message || "Failed to update blood inventory record");
        } finally {
            setLoading(false);
        }
    };

    const deleteBloodInventory = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/blood-inventory/${id}`);
            setBloodInventory((prev) => prev.filter((record) => record._id !== id));
            toast.success("Blood inventory record deleted successfully!");
        } catch (err) {
            console.error("Error deleting blood inventory record:", err);
            toast.error(err?.response?.data?.message || "Failed to delete blood inventory record");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpired = async (id) => {
        setLoading(true);
        try {
            const response = await axios.patch(`/api/blood-inventory/toggle-expired/${id}`);
            setBloodInventory((prev) =>
                prev.map((record) => (record._id === id ? response.data : record))
            );
            toast.success("Expired status toggled successfully!");
        } catch (err) {
            console.error("Error toggling expired status:", err);
            toast.error(err?.response?.data?.message || "Failed to toggle expired status");
        } finally {
            setLoading(false);
        }
    };

    

    return {
        bloodInventory,
        loading,
        fetchBloodInventory,
        fetchBloodInventoryById,
        fetchBloodInventoryByHospital,
        createBloodInventory,
        updateBloodInventory,
        deleteBloodInventory,
        toggleExpired,
    };
};