import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Receiver = sequelize.define('Receiver', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
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
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
        },
    },
    bloodType: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nic: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    activeStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'receivers',
});

// Signin method
Receiver.signin = async function(email, password) {
    if (!email || !password) {
        throw new Error("All Fields are Required");
    }
    const receiver = await this.findOne({ where: { email } });
    if (!receiver) {
        throw new Error("Incorrect Email");
    }
    const match = (password === receiver.password);
    if (!match) {
        throw new Error("Incorrect Password");
    }
    return receiver;
};

export default Receiver;
