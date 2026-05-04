-- Database Schema for Advanced Blood Donation System
-- Generated from Sequelize models

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS blood_donation1_db;
USE blood_donation1_db;

-- System Managers Table
CREATE TABLE system_managers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL UNIQUE,
    nic VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    image VARCHAR(255),
    dob DATE NOT NULL,
    role ENUM('Master', 'Junior') NOT NULL,
    activeStatus BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CHECK (LENGTH(phoneNumber) = 10 AND phoneNumber REGEXP '^[0-9]+$'),
    CHECK (YEAR(CURDATE()) - YEAR(dob) >= 18)
);

-- Hospitals Table
CREATE TABLE hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    systemManagerId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    identificationNumber VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    activeStatus BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (systemManagerId) REFERENCES system_managers(id),
    CHECK (LENGTH(phoneNumber) = 10 AND phoneNumber REGEXP '^[0-9]+$'),
    CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

-- Hospital Admins Table
CREATE TABLE hospital_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL UNIQUE,
    image VARCHAR(255),
    nic VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    dob DATE NOT NULL,
    hospitalId INT NOT NULL,
    activeStatus BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    CHECK (LENGTH(phoneNumber) = 10 AND phoneNumber REGEXP '^[0-9]+$'),
    CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    CHECK (YEAR(CURDATE()) - YEAR(dob) >= 18)
);

-- Donors Table
CREATE TABLE donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    bloodType ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') NOT NULL,
    city VARCHAR(255) NOT NULL,
    nic VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(255),
    activeStatus BOOLEAN DEFAULT TRUE,
    healthStatus BOOLEAN DEFAULT FALSE,
    appointmentStatus BOOLEAN DEFAULT FALSE,
    donationHistory JSON DEFAULT ('[]'),
    totalDonations INT DEFAULT 0,
    lastDonationDate DATE,
    emergencyNotificationsEnabled BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CHECK (LENGTH(phoneNumber) = 10 AND phoneNumber REGEXP '^[0-9]+$'),
    CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    CHECK (YEAR(CURDATE()) - YEAR(dob) >= 18)
);

-- Receivers Table
CREATE TABLE receivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    bloodType ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') NOT NULL,
    city VARCHAR(255) NOT NULL,
    nic VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(255),
    activeStatus BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CHECK (LENGTH(phoneNumber) = 10 AND phoneNumber REGEXP '^[0-9]+$'),
    CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    CHECK (YEAR(CURDATE()) - YEAR(dob) >= 0)
);

-- Blood Requests Table
CREATE TABLE blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiverId INT NOT NULL,
    bloodType ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') NOT NULL,
    unitsRequired INT NOT NULL,
    urgency ENUM('Normal', 'Urgent') NOT NULL DEFAULT 'Normal',
    city VARCHAR(255) NOT NULL,
    hospitalId INT,
    status ENUM('Pending', 'Approved', 'Declined', 'Fulfilled') DEFAULT 'Pending',
    requestDate DATE NOT NULL DEFAULT (CURDATE()),
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (receiverId) REFERENCES receivers(id),
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    CHECK (unitsRequired >= 1)
);

-- Blood Inventories Table
CREATE TABLE blood_inventories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospitalId INT NOT NULL,
    bloodType ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') NOT NULL,
    availableStocks INT NOT NULL,
    expirationDate DATETIME NOT NULL,
    expiredStatus ENUM('Expired', 'Not Expired', 'Soon') DEFAULT 'Not Expired',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    CHECK (availableStocks >= 0),
    CHECK (expirationDate > NOW())
);

-- Blood Donation Appointments Table
CREATE TABLE blood_donation_appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donorId INT NOT NULL,
    hospitalId INT NOT NULL,
    hospitalAdminId INT,
    feedbackStatus BOOLEAN DEFAULT FALSE,
    appointmentDate DATE NOT NULL,
    appointmentTime TIME NOT NULL,
    receiptNumber VARCHAR(255),
    progressStatus ENUM('Not Started', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Not Started',
    activeStatus ENUM('Scheduled', 'Re-Scheduled', 'Accepted', 'Cancelled') DEFAULT 'Scheduled',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (donorId) REFERENCES donors(id),
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    FOREIGN KEY (hospitalAdminId) REFERENCES hospital_admins(id)
);

-- Health Evaluations Table
CREATE TABLE health_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiptNumber VARCHAR(255),
    passStatus ENUM('Pending', 'Passed', 'Failed', 'Cancelled') DEFAULT 'Pending',
    progressStatus ENUM('Not Started', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Not Started',
    feedbackStatus BOOLEAN DEFAULT FALSE,
    activeStatus ENUM('Scheduled', 'Re-Scheduled', 'Accepted', 'Cancelled') DEFAULT 'Scheduled',
    hospitalId INT NOT NULL,
    donorId INT NOT NULL,
    evaluationFile VARCHAR(255),
    hospitalAdminId INT,
    evaluationDate DATE NOT NULL,
    evaluationTime TIME NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    FOREIGN KEY (donorId) REFERENCES donors(id),
    FOREIGN KEY (hospitalAdminId) REFERENCES hospital_admins(id)
);

-- Emergency Blood Requests Table
CREATE TABLE emergency_brs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(10) NOT NULL,
    proofOfIdentificationNumber VARCHAR(255) NOT NULL,
    proofDocument VARCHAR(255),
    patientBlood ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-') NOT NULL,
    units INT NOT NULL,
    criticalLevel ENUM('Low', 'Medium', 'High') NOT NULL,
    withinDate DATE NOT NULL,
    activeStatus ENUM('Active', 'Inactive') DEFAULT 'Inactive',
    hospitalName VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    acceptStatus ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
    declineReason VARCHAR(255),
    acceptedBy INT,
    acceptedByType ENUM('Hospital', 'Donor'),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CHECK (LENGTH(phoneNumber) = 10 AND phoneNumber REGEXP '^[0-9]+$'),
    CHECK (units >= 1)
);

-- Feedbacks Table
CREATE TABLE feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donorId INT NOT NULL,
    systemManagerId INT,
    sessionId INT NOT NULL,
    sessionModel ENUM('BloodDonationAppointment', 'HealthEvaluation') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    comments TEXT NOT NULL,
    feedbackType ENUM('General', 'Technical', 'Complaint') NOT NULL,
    starRating INT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (donorId) REFERENCES donors(id),
    FOREIGN KEY (systemManagerId) REFERENCES system_managers(id),
    CHECK (starRating >= 1 AND starRating <= 5)
);

-- Inquiries Table
CREATE TABLE inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    systemManagerId INT,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('General', 'Technical', 'Complaint', 'Other') NOT NULL,
    attentiveStatus ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (systemManagerId) REFERENCES system_managers(id),
    CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

-- Gamifications Table
CREATE TABLE gamifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donorId INT NOT NULL,
    totalDonations INT DEFAULT 0,
    points INT DEFAULT 0,
    badges JSON DEFAULT ('[]'),
    level INT DEFAULT 1,
    rank INT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (donorId) REFERENCES donors(id)
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    userType ENUM('Donor', 'Receiver', 'General') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    paymentMethod ENUM('JazzCash', 'Easypaisa', 'Card') NOT NULL,
    transactionId VARCHAR(255) UNIQUE,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    purpose ENUM('Donation', 'Campaign', 'Event') NOT NULL,
    campaignId INT,
    eventId INT,
    paymentDate DATE DEFAULT (CURDATE()),
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    CHECK (amount >= 0.01)
);

-- Campaigns Table
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizerId INT NOT NULL,
    organizerType ENUM('Hospital', 'NGO') NOT NULL,
    targetDonors INT,
    registeredDonors JSON DEFAULT ('[]'),
    status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    budget DECIMAL(10, 2),
    image VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Chatbot Interactions Table
CREATE TABLE chatbot_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    userType ENUM('Donor', 'Receiver', 'Hospital', 'Manager', 'Anonymous', 'guest'),
    userMessage TEXT NOT NULL,
    botResponse TEXT NOT NULL,
    intent VARCHAR(255),
    confidence DECIMAL(3, 2),
    sessionId VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Backups Table
CREATE TABLE backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backupType ENUM('Manual', 'Scheduled') NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    fileSize BIGINT,
    status ENUM('In Progress', 'Completed', 'Failed') DEFAULT 'In Progress',
    createdBy INT,
    backupDate DATE DEFAULT (CURDATE()),
    notes TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);
