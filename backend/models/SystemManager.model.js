import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SystemManager = sequelize.define('SystemManager', {
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
    nic: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            isAdult(value) {
                if (new Date().getFullYear() - new Date(value).getFullYear() < 18) {
                    throw new Error('User must be at least 18 years old!');
                }
            },
        },
    },
    role: {
        type: DataTypes.ENUM('Master', 'Junior'),
        allowNull: false,
    },
    activeStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'system_managers',
});

// Signin method
SystemManager.signin = async function (email, password) {
    if (!email || !password) {
        throw new Error("All Fields are Required");
    }
    const manager = await this.findOne({ where: { email } });
    if (!manager) {
        throw new Error('Incorrect Email');
    }
    const match = (password === manager.password);
    if (!match) {
        throw new Error('Incorrect Password');
    }
    return manager;
};

export default SystemManager;
