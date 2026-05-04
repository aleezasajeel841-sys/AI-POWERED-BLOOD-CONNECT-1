import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    organizerId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Hospital or NGO ID
    },
    organizerType: {
        type: DataTypes.ENUM('Hospital', 'NGO'),
        allowNull: false,
    },
    targetDonors: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    registeredDonors: {
        type: DataTypes.JSON, // Array of donor IDs
        defaultValue: [],
    },
    status: {
        type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled'),
        defaultValue: 'Upcoming',
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'campaigns',
});

export default Campaign;
