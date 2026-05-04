import BloodRequest from "../models/bloodRequest.model.js";
import Hospital from "../models/hospital.model.js";
import Donor from "../models/donor.model.js";
import Receiver from "../models/receiver.model.js";
import BloodInventory from "../models/BloodInventory.model.js";
import sendNotification from "../utils/notification.js";

// Get all blood requests
export const getBloodRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find()
            .populate('receiverId', 'firstName lastName phoneNumber')
            .populate('hospitalId', 'name phoneNumber');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blood requests" });
    }
};

// Get blood request by ID
export const getBloodRequestById = async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id)
            .populate('receiverId', 'firstName lastName phoneNumber')
            .populate('hospitalId', 'name phoneNumber');
        if (!request) return res.status(404).json({ message: "Blood request not found" });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blood request" });
    }
};

// Create a new blood request (Receiver posts blood request)
export const createBloodRequest = async (req, res) => {
    try {
        const { receiverId, bloodType, units, urgency, location, hospitalId, message } = req.body;
        
        if (!receiverId || !bloodType || !units || !location) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const newRequest = new BloodRequest({
            receiverId,
            bloodType,
            units,
            urgency: urgency || "Normal",
            location,
            hospitalId,
            message,
            status: "Pending"
        });
        
        await newRequest.save();
        
        // System Notification Triggered
        await triggerSystemNotification(newRequest);
        
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: "Error creating blood request" });
    }
};

// System Notification Triggered
const triggerSystemNotification = async (request) => {
    try {
        // Determine if this is an emergency alert or stock request
        if (request.urgency === "Emergency") {
            // Emergency Alert - Notify nearby donors
            await notifyNearbyDonors(request);
        } else {
            // Stock Request - Notify hospital
            await notifyHospital(request);
        }
    } catch (error) {
        console.error("Error triggering system notification:", error);
    }
};

// Notify nearby donors for emergency requests
export const notifyNearbyDonors = async (request) => {
    try {
        // Find donors with matching blood type and available status
        const compatibleDonors = await Donor.find({
            bloodType: request.bloodType,
            isAvailable: true,
            city: request.location.city // Assuming location has city property
        });

        // Send emergency alerts to compatible donors
        for (const donor of compatibleDonors) {
            await sendNotification({
                userId: donor._id,
                userType: 'Donor',
                subject: 'EMERGENCY: Blood Donation Request',
                message: `URGENT: ${request.bloodType} blood needed immediately at ${request.location.address}. Please respond if you can help.`,
                channels: ['email', 'sms'], // Use both channels for emergency
                attachments: []
            });
        }

        // Update request to show emergency alert was sent
        await BloodRequest.findByIdAndUpdate(request._id, {
            notificationSent: true,
            notificationType: 'Emergency Alert'
        });

    } catch (error) {
        console.error("Error notifying nearby donors:", error);
    }
};

// Notify hospital for stock requests
export const notifyHospital = async (request) => {
    try {
        if (!request.hospitalId) {
            console.error("No hospital specified for stock request");
            return;
        }

        const hospital = await Hospital.findById(request.hospitalId);
        if (!hospital) {
            console.error("Hospital not found");
            return;
        }

        // Send notification to hospital
        await sendNotification({
            userId: hospital._id,
            userType: 'Hospital',
            subject: 'Blood Stock Request',
            message: `A request for ${request.units} units of ${request.bloodType} blood has been received. Please check your dashboard.`,
            channels: ['email'],
            attachments: []
        });

        // Update request to show stock request was sent
        await BloodRequest.findByIdAndUpdate(request._id, {
            notificationSent: true,
            notificationType: 'Stock Request'
        });

    } catch (error) {
        console.error("Error notifying hospital:", error);
    }
};

// Update blood request status (approve/decline)
export const updateBloodRequestStatus = async (req, res) => {
    try {
        const { status, hospitalId, donorId, notes } = req.body;
        const updatedRequest = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { status, hospitalId, donorId, notes },
            { new: true }
        );

        if (!updatedRequest) return res.status(404).json({ message: "Blood request not found" });

        // Send notification to receiver
        const receiver = await Receiver.findById(updatedRequest.receiverId);
        if (receiver) {
            const message = `Your blood request for ${updatedRequest.bloodType} has been ${status.toLowerCase()}.`;
            await sendNotification({
                userId: receiver.id,
                userType: 'Receiver',
                subject: 'Blood Request Update',
                message,
                channels: ['email'],
                attachments: [],
            });
        }

        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: "Error updating blood request status" });
    }
};

// Delete blood request
export const deleteBloodRequest = async (req, res) => {
    try {
        const deletedRequest = await BloodRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) return res.status(404).json({ message: "Blood request not found" });

        res.json({ message: "Blood request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting blood request" });
    }
};

// Donor accepts blood request and shares location
export const donorAcceptRequest = async (req, res) => {
    try {
        const { donorId, location } = req.body;
        
        if (!donorId || !location) {
            return res.status(400).json({ message: "Donor ID and location are required" });
        }
        
        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { 
                donorId,
                donorLocation: location,
                status: "Donor Accepted",
                acceptedAt: new Date()
            },
            { new: true }
        );
        
        if (!request) {
            return res.status(404).json({ message: "Blood request not found" });
        }
        
        // Notify receiver that a donor has accepted
        const receiver = await Receiver.findById(request.receiverId);
        if (receiver) {
            await sendNotification({
                userId: receiver._id,
                userType: 'Receiver',
                subject: 'Donor Found for Your Blood Request',
                message: `A donor has accepted your request for ${request.bloodType} blood. Connection arrangements will be made soon.`,
                channels: ['email'],
                attachments: []
            });
        }
        
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error accepting blood request" });
    }
};

// Hospital confirms blood availability or shortage
export const hospitalConfirmAvailability = async (req, res) => {
    try {
        const { hospitalId, isAvailable, notes } = req.body;
        
        if (!hospitalId) {
            return res.status(400).json({ message: "Hospital ID is required" });
        }
        
        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { 
                hospitalId,
                stockAvailable: isAvailable,
                hospitalNotes: notes,
                status: isAvailable ? "Stock Available" : "Stock Shortage",
                hospitalRespondedAt: new Date()
            },
            { new: true }
        );
        
        if (!request) {
            return res.status(404).json({ message: "Blood request not found" });
        }
        
        // Notify receiver about hospital response
        const receiver = await Receiver.findById(request.receiverId);
        if (receiver) {
            const message = isAvailable 
                ? `${request.bloodType} blood is available at the hospital. Please proceed with arrangements.`
                : `There is a shortage of ${request.bloodType} blood at the hospital. We're looking for alternative sources.`;
                
            await sendNotification({
                userId: receiver._id,
                userType: 'Receiver',
                subject: 'Hospital Response to Blood Request',
                message,
                channels: ['email'],
                attachments: []
            });
        }
        
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error confirming blood availability" });
    }
};

// Get blood requests by hospital
export const getBloodRequestsByHospital = async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const requests = await BloodRequest.find({ hospitalId })
            .populate('receiverId', 'firstName lastName phoneNumber');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blood requests by hospital" });
    }
};

// Arrange connection between donor and receiver/hospital
export const arrangeConnection = async (req, res) => {
    try {
        const { arrangementDetails, meetingTime, meetingLocation, notes } = req.body;
        
        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { 
                arrangementDetails,
                meetingTime,
                meetingLocation,
                arrangementNotes: notes,
                status: "Connection Arranged",
                arrangedAt: new Date()
            },
            { new: true }
        ).populate('donorId').populate('receiverId').populate('hospitalId');
        
        if (!request) {
            return res.status(404).json({ message: "Blood request not found" });
        }
        
        // Notify all parties about the arrangement
        // Notify donor
        if (request.donorId) {
            await sendNotification({
                userId: request.donorId._id,
                userType: 'Donor',
                subject: 'Blood Donation Arrangement Confirmed',
                message: `Your blood donation has been arranged for ${new Date(meetingTime).toLocaleString()} at ${meetingLocation}.`,
                channels: ['email', 'sms'],
                attachments: []
            });
        }
        
        // Notify receiver
        if (request.receiverId) {
            await sendNotification({
                userId: request.receiverId._id,
                userType: 'Receiver',
                subject: 'Blood Donation Arrangement Confirmed',
                message: `Blood donation has been arranged for ${new Date(meetingTime).toLocaleString()} at ${meetingLocation}.`,
                channels: ['email'],
                attachments: []
            });
        }
        
        // Notify hospital
        if (request.hospitalId) {
            await sendNotification({
                userId: request.hospitalId._id,
                userType: 'Hospital',
                subject: 'Blood Donation Arrangement Confirmed',
                message: `A blood donation has been arranged for ${new Date(meetingTime).toLocaleString()} at ${meetingLocation}.`,
                channels: ['email'],
                attachments: []
            });
        }
        
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error arranging connection" });
    }
};

// Record successful blood donation
export const recordSuccessfulDonation = async (req, res) => {
    try {
        const { units, donationNotes } = req.body;
        
        const request = await BloodRequest.findByIdAndUpdate(
            req.params.id,
            { 
                donationCompleted: true,
                actualUnitsDonated: units,
                donationNotes,
                status: "Donation Completed",
                completedAt: new Date()
            },
            { new: true }
        ).populate('donorId').populate('hospitalId');
        
        if (!request) {
            return res.status(404).json({ message: "Blood request not found" });
        }
        
        // Update hospital blood stock levels
        if (request.hospitalId) {
            const inventory = await BloodInventory.findOne({ 
                hospitalId: request.hospitalId._id,
                bloodType: request.bloodType
            });
            
            if (inventory) {
                inventory.unitsAvailable += parseInt(units);
                await inventory.save();
            } else {
                // Create new inventory entry if it doesn't exist
                await BloodInventory.create({
                    hospitalId: request.hospitalId._id,
                    bloodType: request.bloodType,
                    unitsAvailable: parseInt(units)
                });
            }
        }
        
        // Update donor profile - add points and badges
        if (request.donorId) {
            const donor = await Donor.findById(request.donorId._id);
            if (donor) {
                // Increment donation count
                donor.donationCount = (donor.donationCount || 0) + 1;
                
                // Add points
                donor.points = (donor.points || 0) + 50;
                
                // Add badge if applicable
                if (donor.donationCount >= 5 && !donor.badges.includes("Silver Donor")) {
                    donor.badges.push("Silver Donor");
                } else if (donor.donationCount >= 10 && !donor.badges.includes("Gold Donor")) {
                    donor.badges.push("Gold Donor");
                } else if (donor.donationCount >= 25 && !donor.badges.includes("Platinum Donor")) {
                    donor.badges.push("Platinum Donor");
                }
                
                // Update last donation date
                donor.lastDonationDate = new Date();
                
                await donor.save();
            }
        }
        
        // Notify admin for analytics
        // This would typically update some analytics system
        // For now, we'll just log it
        console.log(`Admin notification: Successful donation recorded for request ${request._id}`);
        
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ message: "Error recording successful donation" });
    }
};

// Check hospital stock levels
export const checkHospitalStock = async (req, res) => {
    try {
        const { city, bloodType } = req.query;
        const hospitals = await Hospital.find({ city })
            .populate('bloodInventory', 'bloodType unitsAvailable');

        const stockInfo = hospitals.map(hospital => ({
            hospitalName: hospital.name,
            bloodType,
            unitsAvailable: hospital.bloodInventory?.find(inv => inv.bloodType === bloodType)?.unitsAvailable || 0,
        }));

        res.json(stockInfo);
    } catch (error) {
        res.status(500).json({ message: "Error checking hospital stock" });
    }
};
