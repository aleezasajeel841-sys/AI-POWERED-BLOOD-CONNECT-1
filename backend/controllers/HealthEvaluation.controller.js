import HealthEvaluation from "../models/HealthEvaluation.model.js";
import Donor from "../models/donor.model.js";
// Get all health evaluations
export const getHealthEvaluations = async (req, res) => {
    try {
        const evaluations = await HealthEvaluation.find().populate("hospitalId donorId hospitalAdminId");
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching health evaluations" });
    }
};

// Get a single health evaluation
export const getHealthEvaluationById = async (req, res) => {
    try {
        const evaluation = await HealthEvaluation.findById(req.params.id).populate("hospitalId donorId hospitalAdminId");
        if (!evaluation) return res.status(404).json({ message: "Health evaluation not found" });
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: "Error fetching health evaluation" });
    }
};

// Create a new health evaluation
export const createEvaluation = async (req, res) => {
    try {
        const { hospitalId, donorId, evaluationDate, evaluationTime } = req.body;

        if (!hospitalId || !donorId || !evaluationDate || !evaluationTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newEvaluation = new HealthEvaluation({
            progressStatus: 'Not Started',
            hospitalId,
            donorId,
            evaluationDate,
            evaluationTime,
        });
        await Donor.findByIdAndUpdate(donorId, {healthStatus: true})
        await newEvaluation.save();
 
        
        res.status(201).json({ success: true, data: newEvaluation });
    } catch (error) {
        res.status(400).json({ message: "Error creating health evaluation" });
    }
};

// Update Date and Time of Evaluation
export const updateEvaluationDateTime = async (req, res) => {
    try {
        const { evaluationDate, evaluationTime, hospitalAdminId } = req.body;
        const updatedEvaluation = await HealthEvaluation.findByIdAndUpdate(
            req.params.id,
            { 
                evaluationDate, 
                evaluationTime, 
                activeStatus: "Re-Scheduled", 
                hospitalAdminId
            },
            { new: true }
        );

        if (!updatedEvaluation) return res.status(404).json({ message: "Evaluation not found" });
        res.status(200).json(updatedEvaluation);
    } catch (error) {
        res.status(500).json({ message: "Error updating evaluation date and time" });
    }
};

// Cancel an Evaluation
export const cancelEvaluation = async (req, res) => {
    try {
        const { hospitalAdminId, userId } = req.body;
        const canceledEvaluation = await HealthEvaluation.findByIdAndUpdate(
            req.params.id,
            {
                passStatus: "Cancelled",
                activeStatus: "Cancelled",
                progressStatus: "Cancelled",
                hospitalAdminId
            },
            { new: true }
        );
        await Donor.findByIdAndUpdate(userId, {healthStatus: false})
        if (!canceledEvaluation) return res.status(404).json({ message: "Evaluation not found" });
        res.status(200).json(canceledEvaluation);
    } catch (error) {
        res.status(500).json({ message: "Error cancelling evaluation" });
    }
};

// Accept an Evaluation
export const acceptEvaluation = async (req, res) => {
    try {
        const { hospitalAdminId } = req.body;
        const acceptEvaluation = await HealthEvaluation.findByIdAndUpdate(
            req.params.id,
            { 
                activeStatus: "Accepted", 
                hospitalAdminId 
            },
            { new: true }
        );

        if (!acceptEvaluation) return res.status(404).json({ message: "Evaluation not found" });

        res.status(200).json(acceptEvaluation);
    } catch (error) {
        res.status(500).json({ message: "Error accepting evaluation" });
    }
};

// Arrived for an Evaluation
export const arrivedForEvaluation = async (req, res) => {
    try {
        const { receiptNumber } = req.body;
        const arrivedForEvaluation = await HealthEvaluation.findByIdAndUpdate(
            req.params.id,
            { 
                receiptNumber,
                progressStatus: "In Progress" 
            },
            { new: true }
        );

        if (!arrivedForEvaluation) return res.status(404).json({ message: "Evaluation not found" });

        res.status(200).json(arrivedForEvaluation);
    } catch (error) {
        res.status(500).json({ message: "Error marking evaluation as arrived" });
    }
};

// Complete an Evaluation
export const completeEvaluation = async (req, res) => {
    try {
        const { result } = req.body;
        const file = req.file ? req.file.path : null;

        if (!result) {
            return res.status(400).json({ message: "Result is required" });
        }

        const completedEvaluation = await HealthEvaluation.findByIdAndUpdate(
            req.params.id,
            { 
                passStatus: result, 
                progressStatus: "Completed",
                evaluationFile: file
            },
            { new: true }
        );

        if (!completedEvaluation) {
            return res.status(404).json({ message: "Evaluation not found" });
        }

        res.status(200).json(completedEvaluation);
    } catch (error) {
        res.status(500).json({ message: "Error completing evaluation" });
    }
};

// Delete a health evaluation
export const deleteHealthEvaluation = async (req, res) => {
    try {
        const deletedEvaluation = await HealthEvaluation.findByIdAndDelete(req.params.id);
        if (!deletedEvaluation) return res.status(404).json({ message: "Health evaluation not found" });
        res.json({ message: 'Health Evaluation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting health evaluation" });
    }
};

// Get health evaluations by donor ID
export const getHealthEvaluationByDonorId = async (req, res) => {
    try {
        const { id } = req.params;
        const evaluation = await HealthEvaluation.find({ donorId: id }).populate("hospitalId donorId hospitalAdminId");
        if (!evaluation || evaluation.length === 0) return res.status(404).json({ message: "Health evaluation not found" });
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: "Error fetching health evaluation" });
    }
};

// Get health evaluations by hospital ID
export const getHealthEvaluationByHospitalId = async (req, res) => {
    try {
        const { id } = req.params;
        const evaluation = await HealthEvaluation.find({ hospitalId: id }).populate("hospitalId donorId hospitalAdminId");
        if (!evaluation || evaluation.length === 0) return res.status(404).json({ message: "Health evaluation not found" });
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: "Error fetching health evaluation" });
    }
};

// Cancel evaluation by donor
export const cancelEvaluationDonor = async (req, res) => {
    const { userId } = req.body;
    try {
        const canceledEvaluation = await HealthEvaluation.findByIdAndUpdate(
            req.params.id,
            {
                passStatus: "Cancelled",
                activeStatus: "Cancelled",
                progressStatus: "Cancelled"
            },
            { new: true }
        );
        await Donor.findByIdAndUpdate(userId, {healthStatus: false})
        if (!canceledEvaluation) return res.status(404).json({ message: "Evaluation not found" });
        res.status(200).json(canceledEvaluation);
    } catch (error) {
        res.status(500).json({ message: "Error cancelling evaluation" });
    }
};

export const findLastUpdatedEvaluationByDonor = async (req, res) => {
    try {
        const evaluations = await HealthEvaluation.find({donorId: req.params.id}).sort({ updatedAt: -1 }).limit(1);
        if (!evaluations || evaluations.length === 0) return res.status(404).json({ message: "No evaluations found" });
        res.json(evaluations[0]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching evaluations" });
    }
}   