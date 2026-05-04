import EmergencyBR from "../models/EmergencyBR.model.js";

// Get all emergency requests
export const getEmergencyRequests = async (req, res) => {
    try {
        const requests = await EmergencyBR.find().populate('acceptedBy');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving emergency requests" });
    }
};

// Get a single emergency request by ID
export const getEmergencyRequestById = async (req, res) => {
    try {
        const request = await EmergencyBR.findById(req.params.id).populate('acceptedBy');
        if (!request) return res.status(404).json({ message: "Emergency request not found" });

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving emergency request" });
    }
};

// Create an emergency request
export const createEmergencyRequest = async (req, res) => {
    try {
        const {
            name, phoneNumber, proofOfIdentificationNumber, patientBlood, units,
            criticalLevel, withinDate, hospitalName, address
        } = req.body;

        if (!name || !phoneNumber || !proofOfIdentificationNumber || !patientBlood || !units || 
            !criticalLevel || !withinDate || !hospitalName || !address) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const proofDocument = req.file ? req.file.path : null;

        const newRequest = new EmergencyBR({
            name,
            phoneNumber,
            proofOfIdentificationNumber,
            proofDocument,
            patientBlood,
            units,
            criticalLevel,
            withinDate,
            hospitalName,
            address
        });

        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: "Error creating emergency request" });
    }
};

// Delete an emergency request
export const deleteEmergencyRequest = async (req, res) => {
    try {
        const deletedRequest = await EmergencyBR.findByIdAndDelete(req.params.id);
        if (!deletedRequest) return res.status(404).json({ message: "Emergency request not found" });

        res.json({ message: "Emergency request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting emergency request" });
    }
};

// Validate (activate) an emergency request
export const validateEmergencyRequest = async (req, res) => {
    try {
        const request = await EmergencyBR.findByIdAndUpdate(
            req.params.id,
            { activeStatus: "Active" },
            { new: true }
        );
        if (!request) return res.status(404).json({ message: "Emergency request not found" });

        res.json({ message: "Emergency request validated successfully" }); // Fixed message
    } catch (error) {
        res.status(500).json({ message: "Error validating emergency request" });
    }
};

// Accept an emergency request
export const acceptEmergencyRequest = async (req, res) => {
    try {
        const { acceptedBy, acceptedByType } = req.body;

        if (!acceptedBy || !acceptedByType) {
            return res.status(400).json({
                message: "acceptedBy and acceptedByType are required to accept a request"
            });
        }

        const request = await EmergencyBR.findByIdAndUpdate(
            req.params.id,
            {
                activeStatus: "Inactive",
                acceptStatus: "Accepted",
                acceptedBy,
                acceptedByType
            },
            { new: true }
        ).populate("acceptedBy");

        if (!request) {
            return res.status(404).json({ message: "Emergency request not found" });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error accepting emergency request" });
    }
};

// Decline an emergency request
export const declineEmergencyRequest = async (req, res) => {
    try {
        const { declineReason } = req.body;

        if (!declineReason) {
            return res.status(400).json({ message: "declineReason is required to decline a request" });
        }

        const request = await EmergencyBR.findByIdAndUpdate(
            req.params.id,
            {
                activeStatus: "Inactive",
                acceptStatus: "Declined",
                declineReason
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: "Emergency request not found" });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error declining emergency request" });
    }
};