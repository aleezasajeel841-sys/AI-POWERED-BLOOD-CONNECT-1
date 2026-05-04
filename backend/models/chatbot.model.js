import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ChatbotInteraction = sequelize.define('ChatbotInteraction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null for anonymous users
    },
    userType: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    userMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    botResponse: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    intent: {
        type: DataTypes.STRING, // e.g., 'nearest_hospital', 'donation_rules', 'blood_compatibility'
        allowNull: true,
    },
    confidence: {
        type: DataTypes.DECIMAL(3, 2), // 0.00 to 1.00
        allowNull: true,
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
    tableName: 'chatbot_interactions',
});

export default ChatbotInteraction;
