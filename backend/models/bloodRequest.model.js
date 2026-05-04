import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const BloodRequest = sequelize.define('BloodRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'receivers',
            key: 'id',
        },
    },
    bloodType: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
        allowNull: false,
    },
    unitsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    urgency: {
        type: DataTypes.ENUM('Normal', 'Urgent'),
        allowNull: false,
        defaultValue: 'Normal',
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'hospitals',
            key: 'id',
        },
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Declined', 'Fulfilled'),
        defaultValue: 'Pending',
    },
    requestDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'blood_requests',
});

export default BloodRequest;
