import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import cron from 'node-cron';
import sendNotification from '../utils/notification.js';

const EmergencyBR = sequelize.define('EmergencyBR', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            is: /^\d{10}$/,
        },
    },
    proofOfIdentificationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    proofDocument: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    patientBlood: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
        allowNull: false,
    },
    units: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    criticalLevel: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
    },
    withinDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    activeStatus: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Inactive',
    },
    hospitalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    acceptStatus: {
        type: DataTypes.ENUM('Pending', 'Accepted', 'Declined'),
        defaultValue: 'Pending',
    },
    declineReason: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    acceptedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    acceptedByType: {
        type: DataTypes.ENUM('Hospital', 'Donor'),
        allowNull: true,
        defaultValue: null,
    },
}, {
    timestamps: true,
    tableName: 'emergency_brs',
});
// Static methods
EmergencyBR.handleEmergencyBloodRequest = async function(ebr) {
    try {
        // Skip if EBR is not pending or inactive
        if (ebr.acceptStatus !== 'Pending' || ebr.activeStatus === 'Inactive') {
            console.log(`Skipping EBR ${ebr.id}: Not pending or inactive`);
            return;
        }

        // Check if withinDate is in the future
        const currentDate = new Date().toISOString().split('T')[0];
        if (ebr.withinDate < currentDate) {
            console.log(`Skipping EBR ${ebr.id}: withinDate ${ebr.withinDate} is past`);
            return;
        }

        // 1. Check hospital blood inventory
        const currentDateTime = new Date();
        const BloodInventory = (await import('./BloodInventory.model.js')).default;
        const bloodInventories = await BloodInventory.findAll({
            where: {
                bloodType: ebr.patientBlood,
                availableStocks: { [sequelize.Sequelize.Op.gte]: ebr.units },
                expiredStatus: 'Not Expired',
                expirationDate: { [sequelize.Sequelize.Op.gt]: currentDateTime }
            },
            include: [{
                model: (await import('./hospital.model.js')).default,
                as: 'hospital',
                where: { activeStatus: true },
                attributes: ['name', 'email', 'activeStatus']
            }]
        });

        const hospitals = bloodInventories.map(inventory => ({
            id: inventory.hospital.id,
            name: inventory.hospital.name,
            email: inventory.hospital.email,
            availableStocks: inventory.availableStocks,
            inventoryId: inventory.id
        }));

        // Send emails to hospitals with sufficient stock
        for (const hospital of hospitals) {
            const message = `
An emergency blood request has been created:
- Blood Type: ${ebr.patientBlood}
- Units Needed: ${ebr.units}
- Critical Level: ${ebr.criticalLevel}
- Needed By: ${ebr.withinDate}
- Requesting Hospital: ${ebr.hospitalName} (${ebr.address})

Your hospital has ${hospital.availableStocks} units of ${ebr.patientBlood} available.
Please confirm availability by contacting ${ebr.hospitalName} or replying to this email.

Thank you,
Red Drop Team
            `;
            await sendNotification({
                userId: hospital.id,
                userType: 'Hospital',
                subject: `Emergency Blood Request: ${ebr.patientBlood} Needed`,
                message: message.trim(),
                channels: ['email']
            });
        }

        // 2. Find eligible donors
        const Donor = (await import('./donor.model.js')).default;
        const donors = await Donor.findAll({
            where: {
                bloodType: ebr.patientBlood,
                healthStatus: false,
                appointmentStatus: false,
                activeStatus: true
            },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        // Send emails to eligible donors
        for (const donor of donors) {
            const message = `
An emergency blood request has been created:
- Blood Type: ${ebr.patientBlood}
- Units Needed: ${ebr.units}
- Critical Level: ${ebr.criticalLevel}
- Needed By: ${ebr.withinDate}
- Hospital: ${ebr.hospitalName} (${ebr.address})

Your blood type matches this request. Please schedule a donation appointment at your earliest convenience.
Visit our portal: http://localhost:3000/dashboard

Thank you for your support,
Red Drop Team
            `;
            await sendNotification({
                userId: donor.id,
                userType: 'Donor',
                subject: `Urgent: ${ebr.patientBlood} Blood Donation Needed`,
                message: message.trim(),
                channels: ['email']
            });
        }

        console.log(`Processed EBR ${ebr.id}: Notified ${hospitals.length} hospitals and ${donors.length} donors`);
    } catch (error) {
        console.error(`Error handling EBR ${ebr.id}:`, error);
    }
};

// Hook to trigger automation on EBR creation
EmergencyBR.afterCreate(async (ebr) => {
    await EmergencyBR.handleEmergencyBloodRequest(ebr);
});

// Cron job to check pending EBRs every 5 minutes
if (process.env.VERCEL !== '1') {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const currentDate = new Date().toISOString().split('T')[0];
            const pendingEBRs = await EmergencyBR.findAll({
                where: {
                    acceptStatus: 'Pending',
                    activeStatus: 'Active',
                    withinDate: { [sequelize.Sequelize.Op.gte]: currentDate }
                }
            });
            for (const ebr of pendingEBRs) {
                await EmergencyBR.handleEmergencyBloodRequest(ebr);
            }
            console.log(`Cron job processed ${pendingEBRs.length} pending EBRs`);
        } catch (error) {
            console.error('Cron job error:', error);
        }
    });
}

// Static method to cancel expired requests
EmergencyBR.cancelExpiredRequests = async function () {
    const currentDate = new Date().toISOString().split('T')[0];

    const [affectedRows] = await this.update(
        {
            acceptStatus: 'Declined',
            activeStatus: 'Inactive'
        },
        {
            where: {
                withinDate: { [sequelize.Sequelize.Op.lt]: currentDate }
            }
        }
    );

    console.log(`Cancelled ${affectedRows} expired emergency blood requests`);
};


export default EmergencyBR;
