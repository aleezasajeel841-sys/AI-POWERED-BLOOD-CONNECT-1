import Inquiry from '../models/inquiry.model.js';

// Fetch all inquiries
export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find();
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inquiries' });
    }
};

// Fetch a specific inquiry by ID
export const getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
            .populate('systemManagerId', 'name email');
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.json(inquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inquiry' });
    }
};

// Create a new inquiry
export const createInquiry = async (req, res) => {
    const { email, subject, message, category } = req.body;

    try {
        const newInquiry = new Inquiry({
            email,
            subject,
            message,
            category
        });

        await newInquiry.save();
        res.status(201).json({ message: 'Inquiry created successfully', inquiry: newInquiry });
    } catch (error) {
        res.status(500).json({ message: 'Error creating inquiry' });
    }
};

// Update an inquiry's status
export const updateInquiryStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const inquiry = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { attentiveStatus: status },
            { new: true }
        );
        
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.json({ message: 'Inquiry updated successfully', inquiry });
    } catch (error) {
        res.status(500).json({ message: 'Error updating inquiry' });
    }
};

// Delete an inquiry by ID
export const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.json({ message: 'Inquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting inquiry' });
    }
};