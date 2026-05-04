import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Inquiry = sequelize.define('Inquiry', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    systemManagerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'system_managers',
            key: 'id',
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('General', 'Technical', 'Complaint', 'Other'),
        allowNull: false,
    },
    attentiveStatus: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved'),
        defaultValue: 'Pending',
    },
}, {
    timestamps: true,
    tableName: 'inquiries',
});

export default Inquiry;
