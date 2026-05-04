import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    donorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'donors',
            key: 'id',
        },
    },
    systemManagerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'system_managers',
            key: 'id',
        },
    },
    sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sessionModel: {
        type: DataTypes.ENUM('BloodDonationAppointment', 'HealthEvaluation'),
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    feedbackType: {
        type: DataTypes.ENUM('General', 'Technical', 'Complaint'),
        allowNull: false,
    },
    starRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
}, {
    timestamps: true,
    tableName: 'feedbacks',
});

export default Feedback;
