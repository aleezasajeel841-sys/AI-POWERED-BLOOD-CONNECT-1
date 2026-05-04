import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email setup
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// // Twilio setup
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// User models (adjust paths to your actual files)
const models = {
    Donor: () => import('../models/donor.model.js'),
    HospitalAdmin: () => import('../models/HospitalAdmin.model.js'),
    SystemManager: () => import('../models/SystemManager.model.js'),
    Hospital: () => import('../models/hospital.model.js'),
    User: () => import('../models/User.model.js') // Fallback or unified model
};

const sendNotification = async ({ userId, userType, subject, message, channels = ['email'], attachments = [] }) => {
    try {
        if (!userId || !userType) throw new Error('userId and userType are required');
        if (!['Donor', 'HospitalAdmin', 'SystemManager', 'Hospital', 'User'].includes(userType)) {
            throw new Error('Invalid userType');
        }

        const Model = await models[userType]();
        const user = await Model.default.findById(userId);
        if (!user) throw new Error(`${userType} not found`);

        // Fetch contact details
        let email, phone;
        switch (userType) {
            case 'Donor':
                email = user.email;
                phone = user.phoneNumber;
                break;
            case 'HospitalAdmin':
                email = user.email || (await (await models.Hospital()).default.findById(user.hospitalId))?.email;
                phone = user.phoneNumber || (await (await models.Hospital()).default.findById(user.hospitalId))?.phoneNumber;
                break;
            case 'SystemManager':
                email = user.email;
                phone = user.phoneNumber;
                break;
            case 'Hospital':
                email = user.email;
                phone = user.phoneNumber;
                break;
            default:
                throw new Error('Unhandled userType');
        }

        if (!email /* && !phone */) throw new Error('No contact details available for this user');

        const results = {};

        if (channels.includes('email') && email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: subject || 'Blood Connect Notification',
                text: message,
                attachments: attachments.length ? attachments : undefined
            };
            await emailTransporter.sendMail(mailOptions);
            results.email = 'Email sent successfully';
            console.log(`Email sent to ${email}`);
        }

        // if (channels.includes('sms') && phone && twilioPhoneNumber) {
        //     await twilioClient.messages.create({
        //         body: message,
        //         from: twilioPhoneNumber,
        //         to: phone
        //     });
        //     results.sms = 'SMS sent successfully';
        //     console.log(`SMS sent to ${phone}`);
        // }

        // if (channels.includes('whatsapp') && phone && twilioPhoneNumber) {
        //     await twilioClient.messages.create({
        //         body: message,
        //         from: `whatsapp:${twilioPhoneNumber}`,
        //         to: `whatsapp:${phone}`
        //     });
        //     results.whatsapp = 'WhatsApp message sent successfully';
        //     console.log(`WhatsApp message sent to ${phone}`);
        // }

        return { success: true, results };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
};

export default sendNotification;