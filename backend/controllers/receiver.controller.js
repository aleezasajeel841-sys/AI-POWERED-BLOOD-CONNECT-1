import Receiver from "../models/receiver.model.js";
import BloodRequest from "../models/bloodRequest.model.js";
import sendNotification from "../utils/notification.js";

// Get all receivers
export const getReceivers = async (req, res) => {
    try {
        const receivers = await Receiver.find();
        res.json(receivers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching receivers" });
    }
};

// Get a single receiver by ID
export const getReceiverById = async (req, res) => {
    try {
        const receiver = await Receiver.findById(req.params.id);
        if (!receiver) return res.status(404).json({ message: "Receiver not found" });
        res.json(receiver);
    } catch (error) {
        res.status(500).json({ message: "Error fetching receiver" });
    }
};

// Create a new receiver
export const createReceiver = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            gender,
            phoneNumber,
            email,
            password,
            dob,
            bloodType,
            city,
            nic
        } = req.body;

        if (!firstName || !lastName || !gender || !phoneNumber || !email || !password || !dob || !bloodType || !city || !nic) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const image = req.file ? req.file.path : null;

        const newReceiver = new Receiver({
            firstName,
            lastName,
            gender,
            phoneNumber,
            email,
            password,
            dob,
            bloodType,
            city,
            nic,
            image,
        });

        await newReceiver.save();
        res.status(201).json(newReceiver);
    } catch (error) {
        res.status(400).json({ message: "Error creating receiver" });
    }
};

// Update receiver details
export const updateReceiver = async (req, res) => {
    try {
        let { password, ...otherUpdates } = req.body;

        if (password) {
            password = await bcrypt.hash(password, 10);
            otherUpdates.password = password;
        }

        const updatedReceiver = await Receiver.findByIdAndUpdate(
            req.params.id,
            otherUpdates,
            { new: true, runValidators: true }
        );

        if (!updatedReceiver) return res.status(404).json({ message: "Receiver not found" });

        res.status(200).json(updatedReceiver);
    } catch (error) {
        res.status(500).json({ message: "Error updating receiver" });
    }
};

// Delete a receiver
export const deleteReceiver = async (req, res) => {
    try {
        const deletedReceiver = await Receiver.findByIdAndDelete(req.params.id);
        if (!deletedReceiver) return res.status(404).json({ message: "Receiver not found" });

        res.json({ message: "Receiver deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting receiver" });
    }
};

// Activate/Deactivate receiver status
export const activateDeactivateReceiver = async (req, res) => {
    try {
        const { id } = req.params;

        const receiver = await Receiver.findById(id);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        const newStatus = !receiver.activeStatus;
        const updatedReceiver = await Receiver.findByIdAndUpdate(
            id,
            { $set: { activeStatus: newStatus } },
            { new: true }
        );

        res.status(200).json({
            message: `Receiver ${newStatus ? 'activated' : 'deactivated'} successfully`,
            receiver: updatedReceiver,
        });
    } catch (error) {
        res.status(500).json({ message: "Error toggling receiver status" });
    }
};

// Create blood request
export const createBloodRequest = async (req, res) => {
    try {
        const { bloodType, unitsRequired, urgency, city, notes } = req.body;
        const receiverId = req.user.id; // Assuming auth middleware sets req.user

        const newRequest = new BloodRequest({
            receiverId,
            bloodType,
            unitsRequired,
            urgency,
            city,
            notes,
        });

        await newRequest.save();

        // Send notification to nearby donors (logic to be implemented)
        // For now, just return success
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ message: "Error creating blood request" });
    }
};

// Get blood requests by receiver
export const getBloodRequestsByReceiver = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const requests = await BloodRequest.find({ receiverId });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blood requests" });
    }
};

// Search donors by city and blood type
export const searchDonors = async (req, res) => {
    try {
        const { city, bloodType } = req.query;
        const donors = await Receiver.find({ city, bloodType, activeStatus: true });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: "Error searching donors" });
    }
};
