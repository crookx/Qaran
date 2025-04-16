import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No image file provided', 400));
        }

        const filename = req.file.filename;
        const filepath = path.join(uploadsDir, filename);

        // Auto-optimize image on upload
        await sharp(filepath)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(path.join(uploadsDir, `optimized-${filename}`));

        res.status(201).json({
            status: 'success',
            data: {
                filename,
                optimizedFilename: `optimized-${filename}`,
                path: `/uploads/${filename}`
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getImage = async (req, res, next) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(uploadsDir, filename);

        const exists = await fs.access(filepath)
            .then(() => true)
            .catch(() => false);

        if (!exists) {
            return next(new AppError('Image not found', 404));
        }

        res.sendFile(filepath);
    } catch (error) {
        next(error);
    }
};

export const optimizeImage = async (req, res, next) => {
    try {
        const { filename } = req.params;
        const { width, height, quality } = req.body;
        const filepath = path.join(uploadsDir, filename);

        const optimizedFilename = `optimized-${width}x${height}-${filename}`;
        const optimizedFilepath = path.join(uploadsDir, optimizedFilename);

        await sharp(filepath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: quality || 85 })
            .toFile(optimizedFilepath);

        res.status(200).json({
            status: 'success',
            data: {
                filename: optimizedFilename,
                path: `/uploads/${optimizedFilename}`
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteImage = async (req, res, next) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(uploadsDir, filename);

        const exists = await fs.access(filepath)
            .then(() => true)
            .catch(() => false);

        if (!exists) {
            return next(new AppError('Image not found', 404));
        }

        await fs.unlink(filepath);

        // Try to delete optimized version if it exists
        const optimizedPath = path.join(uploadsDir, `optimized-${filename}`);
        await fs.unlink(optimizedPath).catch(() => {});

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};