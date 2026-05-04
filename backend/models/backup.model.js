import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Backup = sequelize.define('Backup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    backupType: {
        type: DataTypes.ENUM('Manual', 'Scheduled'),
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('In Progress', 'Completed', 'Failed'),
        defaultValue: 'In Progress',
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true, // User ID who initiated the backup
    },
    backupDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'backups',
});

export default Backup;
