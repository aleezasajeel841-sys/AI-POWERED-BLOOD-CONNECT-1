import Gamification from "../models/gamification.model.js";
import Donor from "../models/donor.model.js";
import BloodDonationAppointment from "../models/BloodDonationAppointment.model.js";

// Get gamification data for a donor
export const getGamificationByDonor = async (req, res) => {
    try {
        const donorId = req.params.id;
        let gamification = await Gamification.findOne({ where: { donorId } });

        if (!gamification) {
            // Create initial gamification record if not exists
            gamification = await Gamification.create({ donorId });
        }

        res.json(gamification);
    } catch (error) {
        res.status(500).json({ message: "Error fetching gamification data" });
    }
};

// Update gamification after donation
export const updateGamificationAfterDonation = async (donorId) => {
    try {
        let gamification = await Gamification.findOne({ where: { donorId } });

        if (!gamification) {
            gamification = await Gamification.create({ donorId });
        }

        // Update total donations
        const totalDonations = await BloodDonationAppointment.count({
            where: { donorId, progressStatus: 'Completed' }
        });

        gamification.totalDonations = totalDonations;
        gamification.points = totalDonations * 10; // 10 points per donation

        // Update badges
        const badges = [];
        if (totalDonations >= 1) badges.push('First Time Donor');
        if (totalDonations >= 5) badges.push('Regular Donor');
        if (totalDonations >= 10) badges.push('Hero Donor');
        if (totalDonations >= 25) badges.push('Life Saver');

        gamification.badges = badges;

        // Update level
        gamification.level = Math.floor(totalDonations / 5) + 1;

        await gamification.save();

        // Update ranks
        await Gamification.updateRanks();

        return gamification;
    } catch (error) {
        console.error('Error updating gamification:', error);
        throw error;
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Gamification.findAll({
            include: [{
                model: Donor,
                attributes: ['firstName', 'lastName', 'city']
            }],
            order: [['points', 'DESC'], ['totalDonations', 'DESC']],
            limit: 10
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard" });
    }
};

// Get donor badges
export const getDonorBadges = async (req, res) => {
    try {
        const donorId = req.params.id;
        const gamification = await Gamification.findOne({ where: { donorId } });

        if (!gamification) {
            return res.json({ badges: [] });
        }

        res.json({ badges: gamification.badges });
    } catch (error) {
        res.status(500).json({ message: "Error fetching donor badges" });
    }
};
