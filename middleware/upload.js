import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Create multer upload instance
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Error handler for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'File size is too large. Max size is 5MB'
            });
        }
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    next(err);
};