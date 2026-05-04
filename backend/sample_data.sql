-- Sample Data Inserts

-- Insert System Managers
INSERT INTO system_managers (email, password, firstName, lastName, phoneNumber, nic, address, dob, role, activeStatus, createdAt, updatedAt) VALUES
('master@bloodsystem.com', 'hashedpassword1', 'Ahmed', 'Khan', '03001234567', '1234567890123', 'Lahore, Pakistan', '1980-05-15', 'Master', TRUE, NOW(), NOW()),
('junior@bloodsystem.com', 'hashedpassword2', 'Fatima', 'Ali', '03009876543', '9876543210987', 'Karachi, Pakistan', '1985-08-20', 'Junior', TRUE, NOW(), NOW());

-- Insert Hospitals
INSERT INTO hospitals (systemManagerId, name, city, identificationNumber, address, phoneNumber, email, password, startTime, endTime, activeStatus, createdAt, updatedAt) VALUES
(1, 'City General Hospital', 'Lahore', 'HOSP001', '123 Main Street, Lahore', '0421234567', 'info@citygeneral.pk', 'hashedpassword3', '08:00:00', '18:00:00', TRUE, NOW(), NOW()),
(1, 'Metro Medical Center', 'Karachi', 'HOSP002', '456 Health Avenue, Karachi', '0217654321', 'contact@metromedical.pk', 'hashedpassword4', '09:00:00', '17:00:00', TRUE, NOW(), NOW());

-- Insert Hospital Admins
INSERT INTO hospital_admins (email, password, firstName, lastName, phoneNumber, nic, address, dob, hospitalId, activeStatus, createdAt, updatedAt) VALUES
('admin1@citygeneral.pk', 'hashedpassword5', 'Muhammad', 'Ahmed', '03005551234', '1111111111111', 'Lahore', '1990-03-10', 1, TRUE, NOW(), NOW()),
('admin2@metromedical.pk', 'hashedpassword6', 'Ayesha', 'Bibi', '03006662345', '2222222222222', 'Karachi', '1988-07-25', 2, TRUE, NOW(), NOW());

-- Insert Donors
INSERT INTO donors (firstName, lastName, gender, phoneNumber, email, password, dob, bloodType, city, nic, activeStatus, healthStatus, appointmentStatus, donationHistory, totalDonations, lastDonationDate, emergencyNotificationsEnabled, createdAt, updatedAt) VALUES
('Ali', 'Raza', 'Male', '03007773456', 'ali.raza@email.com', 'hashedpassword7', '1995-12-01', 'A+', 'Lahore', '3333333333333', TRUE, TRUE, FALSE, '[{"date": "2024-01-15", "units": 1}]', 1, '2024-01-15', TRUE, NOW(), NOW()),
('Sara', 'Khan', 'Female', '03008884567', 'sara.khan@email.com', 'hashedpassword8', '1992-06-20', 'O-', 'Karachi', '4444444444444', TRUE, TRUE, TRUE, '[{"date": "2024-02-10", "units": 1}, {"date": "2023-08-05", "units": 1}]', 2, '2024-02-10', TRUE, NOW(), NOW()),
('Bilal', 'Hussain', 'Male', '03009995678', 'bilal.hussain@email.com', 'hashedpassword9', '1987-09-15', 'B+', 'Islamabad', '5555555555555', TRUE, FALSE, FALSE, '[]', 0, NULL, TRUE, NOW(), NOW());

-- Insert Receivers
INSERT INTO receivers (firstName, lastName, gender, phoneNumber, email, password, dob, bloodType, city, nic, activeStatus, createdAt, updatedAt) VALUES
('Zara', 'Malik', 'Female', '03001116789', 'zara.malik@email.com', 'hashedpassword10', '1985-04-12', 'AB+', 'Lahore', '6666666666666', TRUE, NOW(), NOW()),
('Omar', 'Farooq', 'Male', '03002227890', 'omar.farooq@email.com', 'hashedpassword11', '1978-11-30', 'A-', 'Karachi', '7777777777777', TRUE, NOW(), NOW());

-- Insert Blood Requests
INSERT INTO blood_requests (receiverId, bloodType, unitsRequired, urgency, city, hospitalId, status, requestDate, notes, createdAt, updatedAt) VALUES
(1, 'AB+', 2, 'Urgent', 'Lahore', 1, 'Pending', CURDATE(), 'Emergency surgery required', NOW(), NOW()),
(2, 'A-', 1, 'Normal', 'Karachi', 2, 'Approved', CURDATE(), 'Regular transfusion', NOW(), NOW());

-- Insert Blood Inventories
INSERT INTO blood_inventories (hospitalId, bloodType, availableStocks, expirationDate, expiredStatus, createdAt, updatedAt) VALUES
(1, 'A+', 50, '2024-12-31 23:59:59', 'Not Expired', NOW(), NOW()),
(1, 'O-', 30, '2024-11-15 23:59:59', 'Not Expired', NOW(), NOW()),
(2, 'B+', 40, '2024-10-20 23:59:59', 'Not Expired', NOW(), NOW());

-- Insert Blood Donation Appointments
INSERT INTO blood_donation_appointments (donorId, hospitalId, hospitalAdminId, appointmentDate, appointmentTime, progressStatus, activeStatus, createdAt, updatedAt) VALUES
(1, 1, 1, '2024-05-20', '10:00:00', 'Completed', 'Accepted', NOW(), NOW()),
(2, 2, 2, '2024-05-25', '14:30:00', 'In Progress', 'Scheduled', NOW(), NOW());

-- Insert Health Evaluations
INSERT INTO health_evaluations (passStatus, progressStatus, activeStatus, hospitalId, donorId, hospitalAdminId, evaluationDate, evaluationTime, createdAt, updatedAt) VALUES
('Passed', 'Completed', 'Accepted', 1, 1, 1, '2024-05-20', '09:00:00', NOW(), NOW()),
('Pending', 'Not Started', 'Scheduled', 2, 2, 2, '2024-05-25', '13:30:00', NOW(), NOW());

-- Insert Emergency Blood Requests
INSERT INTO emergency_brs (name, phoneNumber, proofOfIdentificationNumber, patientBlood, units, criticalLevel, withinDate, hospitalName, address, createdAt, updatedAt) VALUES
('Emergency Patient 1', '03003338901', 'ID123456', 'O+', 3, 'High', '2024-05-22', 'City General Hospital', '123 Main Street, Lahore', NOW(), NOW()),
('Emergency Patient 2', '03004449012', 'ID789012', 'AB-', 2, 'Medium', '2024-05-23', 'Metro Medical Center', '456 Health Avenue, Karachi', NOW(), NOW());

-- Insert Feedbacks
INSERT INTO feedbacks (donorId, systemManagerId, sessionId, sessionModel, subject, comments, feedbackType, starRating, createdAt, updatedAt) VALUES
(1, 1, 1, 'BloodDonationAppointment', 'Great Experience', 'The staff was very professional and caring.', 'General', 5, NOW(), NOW()),
(2, 2, 2, 'HealthEvaluation', 'Process Improvement', 'The evaluation process could be faster.', 'Technical', 4, NOW(), NOW());

-- Insert Inquiries
INSERT INTO inquiries (systemManagerId, email, subject, message, category, attentiveStatus, createdAt, updatedAt) VALUES
(1, 'user1@email.com', 'Donation Process', 'How can I become a regular donor?', 'General', 'Resolved', NOW(), NOW()),
(2, 'user2@email.com', 'Technical Issue', 'App is not loading properly.', 'Technical', 'In Progress', NOW(), NOW());

-- Insert Gamifications
INSERT INTO gamifications (donorId, totalDonations, points, badges, level, rank, createdAt, updatedAt) VALUES
(1, 1, 100, '["First Donation"]', 1, 2, NOW(), NOW()),
(2, 2, 250, '["Regular Donor", "Life Saver"]', 2, 1, NOW(), NOW()),
(3, 0, 0, '[]', 1, 3, NOW(), NOW());

-- Insert Payments
INSERT INTO payments (userId, userType, amount, paymentMethod, status, purpose, paymentDate, createdAt, updatedAt) VALUES
(1, 'Donor', 500.00, 'JazzCash', 'Completed', 'Donation', CURDATE(), NOW(), NOW()),
(2, 'Receiver', 1000.00, 'Card', 'Pending', 'Campaign', CURDATE(), NOW(), NOW());

-- Insert Campaigns
INSERT INTO campaigns (title, description, startDate, endDate, location, organizerId, organizerType, targetDonors, status, budget, createdAt, updatedAt) VALUES
('Blood Drive 2024', 'Annual blood donation campaign', '2024-06-01', '2024-06-30', 'Lahore Convention Center', 1, 'Hospital', 500, 'Upcoming', 50000.00, NOW(), NOW()),
('Emergency Blood Collection', 'Urgent blood collection for disaster relief', '2024-05-15', '2024-05-20', 'Karachi Stadium', 2, 'Hospital', 200, 'Ongoing', 25000.00, NOW(), NOW());

-- Insert Chatbot Interactions
INSERT INTO chatbot_interactions (userId, userType, userMessage, botResponse, intent, confidence, sessionId, createdAt, updatedAt) VALUES
(NULL, 'Anonymous', 'How to donate blood?', 'To donate blood, you need to be 18+ years old, weigh at least 50kg, and be in good health.', 'donation_rules', 0.95, 'session123', NOW(), NOW()),
(1, 'Donor', 'Nearest hospital?', 'The nearest hospital to your location is City General Hospital, 2km away.', 'nearest_hospital', 0.88, 'session456', NOW(), NOW());

-- Insert Backups
INSERT INTO backups (backupType, fileName, filePath, fileSize, status, createdBy, backupDate, notes, createdAt, updatedAt) VALUES
('Scheduled', 'backup_2024_05_15.sql', '/backups/backup_2024_05_15.sql', 1048576, 'Completed', 1, CURDATE(), 'Daily automated backup', NOW(), NOW()),
('Manual', 'manual_backup.sql', '/backups/manual_backup.sql', 2097152, 'Completed', 2, CURDATE(), 'Manual backup before system update', NOW(), NOW());
