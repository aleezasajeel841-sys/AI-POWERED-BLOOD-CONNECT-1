import Backup from "../models/backup.model.js";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Get all backups
export const getBackups = async (req, res) => {
    try {
        const backups = await Backup.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ message: "Error fetching backups" });
    }
};

// Create manual backup
export const createBackup = async (req, res) => {
    try {
        const { notes } = req.body;
        const createdBy = req.user?.id; // Assuming auth middleware

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `backup-${timestamp}.sql`;
        const filePath = path.join(process.cwd(), 'backups', fileName);

        // Ensure backups directory exists
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        // Create backup record
        const backup = await Backup.create({
            backupType: 'Manual',
            fileName,
            filePath,
            status: 'In Progress',
            createdBy,
            notes,
        });

        // Execute mysqldump (assuming MySQL)
        const dumpCommand = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > "${filePath}"`;

        exec(dumpCommand, async (error, stdout, stderr) => {
            if (error) {
                await backup.update({ status: 'Failed' });
                console.error('Backup failed:', error);
                return;
            }

            // Get file size
            const stats = fs.statSync(filePath);
            await backup.update({
                status: 'Completed',
                fileSize: stats.size
            });

            console.log('Backup completed successfully');
        });

        res.status(201).json({
            message: 'Backup initiated',
            backup
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating backup" });
    }
};

// Download backup
export const downloadBackup = async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (!backup) return res.status(404).json({ message: "Backup not found" });

        if (backup.status !== 'Completed') {
            return res.status(400).json({ message: "Backup is not ready for download" });
        }

        if (!fs.existsSync(backup.filePath)) {
            return res.status(404).json({ message: "Backup file not found" });
        }

        res.download(backup.filePath, backup.fileName);
    } catch (error) {
        res.status(500).json({ message: "Error downloading backup" });
    }
};

// Delete backup
export const deleteBackup = async (req, res) => {
    try {
        const backup = await Backup.findByPk(req.params.id);
        if (!backup) return res.status(404).json({ message: "Backup not found" });

        // Delete file if exists
        if (fs.existsSync(backup.filePath)) {
            fs.unlinkSync(backup.filePath);
        }

        await backup.destroy();

        res.json({ message: "Backup deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting backup" });
    }
};

// Scheduled backup (to be called by cron job)
export const scheduledBackup = async () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `scheduled-backup-${timestamp}.sql`;
        const filePath = path.join(process.cwd(), 'backups', fileName);

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        const backup = await Backup.create({
            backupType: 'Scheduled',
            fileName,
            filePath,
            status: 'In Progress',
        });

        const dumpCommand = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > "${filePath}"`;

        exec(dumpCommand, async (error, stdout, stderr) => {
            if (error) {
                await backup.update({ status: 'Failed' });
                console.error('Scheduled backup failed:', error);
                return;
            }

            const stats = fs.statSync(filePath);
            await backup.update({
                status: 'Completed',
                fileSize: stats.size
            });

            console.log('Scheduled backup completed successfully');
        });
    } catch (error) {
        console.error('Error in scheduled backup:', error);
    }
};
