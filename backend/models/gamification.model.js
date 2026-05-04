import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Gamification = sequelize.define('Gamification', {
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
    totalDonations: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    badges: {
        type: DataTypes.JSON, // Array of badge names
        defaultValue: [],
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: true, // Will be calculated dynamically
    },
}, {
    timestamps: true,
    tableName: 'gamifications',
});

// Static method to update ranks
Gamification.updateRanks = async function() {
    const gamifications = await this.findAll({
        order: [['points', 'DESC'], ['totalDonations', 'DESC']],
    });

    for (let i = 0; i < gamifications.length; i++) {
        await gamifications[i].update({ rank: i + 1 });
    }
};

export default Gamification;
