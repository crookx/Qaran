import fs from 'fs/promises';
import path from 'path';

export const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
        // Don't throw error if file doesn't exist
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
};

export const isValidFilePath = (filePath) => {
    // Check if path is valid and within uploads directory
    const normalizedPath = path.normalize(filePath);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    return normalizedPath.startsWith(uploadsDir);
};