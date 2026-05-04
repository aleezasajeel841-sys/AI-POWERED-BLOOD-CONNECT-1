import Hospital from "../models/hospital.model.js";

// Get all hospitals
export const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching hospitals" });
    }
};

// Get a hospital by ID
export const getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) return res.status(404).json({ message: "Hospital not found" });
        res.json(hospital);
    } catch (error) {
        res.status(500).json({ message: "Error fetching hospital" });
    }
};

// Create a new hospital
export const createHospital = async (req, res) => {
    try {
        const { name, city, systemManagerId, identificationNumber, email, password, phoneNumber, address, startTime, endTime, activeStatus } = req.body;

        const image = req.file ? req.file.path : null;

        const newHospital = new Hospital({
            name,
            city,
            systemManagerId,
            identificationNumber,
            email,
            password,
            phoneNumber,
            address,
            startTime,
            endTime,
            image,
            activeStatus: activeStatus !== undefined ? activeStatus : true,
        });

        await newHospital.save();
        res.status(201).json(newHospital);
    } catch (error) {
        res.status(400).json({ message: "Error creating hospital" });
    }
};

// Update hospital details
export const updateHospital = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        if (req.file) {
            updatedData.image = req.file.path;
        }

        const updatedHospital = await Hospital.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!updatedHospital) return res.status(404).json({ message: "Hospital not found" });

        res.status(200).json(updatedHospital);
    } catch (error) {
        res.status(500).json({ message: "Error updating hospital" });
    }
};

// Delete hospital
export const deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedHospital = await Hospital.findByIdAndDelete(id);

        if (!deletedHospital) return res.status(404).json({ message: "Hospital not found" });

        res.status(200).json({ message: "Hospital deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting hospital" });
    }
};

// Toggle hospital active status
export const toggleHospitalStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findById(id);
        if (!hospital) return res.status(404).json({ message: "Hospital not found" });

        const newStatus = !hospital.activeStatus;
        const updatedHospital = await Hospital.findByIdAndUpdate(id, { activeStatus: newStatus }, { new: true });

        res.status(200).json({
            message: `Hospital ${newStatus ? 'activated' : 'deactivated'} successfully`,
            hospital: updatedHospital,
        });
    } catch (error) {
        res.status(500).json({ message: "Error toggling hospital status" });
    }
};