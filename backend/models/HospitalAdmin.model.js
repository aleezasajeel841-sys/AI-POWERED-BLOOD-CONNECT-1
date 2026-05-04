import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import validator from 'validator';
import moment from 'moment';

const HospitalAdmin = sequelize.define('HospitalAdmin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
            is: /^\d{10}$/,
        },
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nic: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            isAdult(value) {
                if (moment().diff(moment(value), 'years') < 18) {
                    throw new Error('User must be at least 18 years old!');
                }
            },
        },
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'hospitals',
            key: 'id',
        },
    },
    activeStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'hospital_admins',
});

// Signin method
HospitalAdmin.signin = async function (email, password, hospitalId) {
    if (!email || !password || !hospitalId) {
        throw new Error("All fields are required");
    }
    const hospitalAdmin = await this.findOne({ where: { email } });
    if (!hospitalAdmin) {
        throw new Error('Incorrect email');
    }
    if (hospitalAdmin.hospitalId !== parseInt(hospitalId)) {
        throw new Error('Incorrect hospital ID');
    }
    const match = (password === hospitalAdmin.password);
    if (!match) {
        throw new Error('Incorrect password');
    }
    return hospitalAdmin;
};

export default HospitalAdmin;
