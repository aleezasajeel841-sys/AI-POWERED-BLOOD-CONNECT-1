import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const BloodInventory = sequelize.define('BloodInventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'hospitals',
            key: 'id',
        },
    },
    bloodType: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
        allowNull: false,
    },
    availableStocks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: new Date().toISOString(),
        },
    },
    expiredStatus: {
        type: DataTypes.ENUM('Expired', 'Not Expired', 'Soon'),
        defaultValue: 'Not Expired',
    },
}, {
    timestamps: true,
    tableName: 'blood_inventories',
});

// Static methods
BloodInventory.updateExpiredStatus = async function () {
    const currentDateTime = new Date();
    console.log("Current Date and Time: ", currentDateTime);

    await this.update(
        { expiredStatus: 'Expired' },
        {
            where: {
                expirationDate: { [sequelize.Sequelize.Op.lte]: currentDateTime },
                expiredStatus: { [sequelize.Sequelize.Op.ne]: 'Expired' }
            }
        }
    );
};

BloodInventory.updateExpiringSoonStatus = async function () {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + 14);

    const [affectedRows] = await this.update(
        { expiredStatus: 'Soon' },
        {
            where: {
                expirationDate: {
                    [sequelize.Sequelize.Op.gt]: now,
                    [sequelize.Sequelize.Op.lte]: threshold
                },
                expiredStatus: { [sequelize.Sequelize.Op.ne]: 'Soon' }
            }
        }
    );

    if (affectedRows > 0) {
        console.log(`Marked ${affectedRows} items as 'Soon'`);
    } else {
        console.log('No expiring soon items found');
    }
};

export default BloodInventory;
