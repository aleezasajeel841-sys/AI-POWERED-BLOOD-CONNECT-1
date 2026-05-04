import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Can be donor, receiver, or general user
    },
    userType: {
        type: DataTypes.ENUM('Donor', 'Receiver', 'General'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01,
        },
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'PKR',
    },
    paymentMethod: {
        type: DataTypes.ENUM('JazzCash', 'Easypaisa', 'Card'),
        allowNull: false,
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Refunded'),
        defaultValue: 'Pending',
    },
    purpose: {
        type: DataTypes.ENUM('Donation', 'Campaign', 'Event'),
        allowNull: false,
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Reference to campaign if applicable
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Reference to event if applicable
    },
    paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'payments',
});

export default Payment;
