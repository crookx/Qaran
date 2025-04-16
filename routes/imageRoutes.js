import express from 'express';
import {
    uploadImage,
    deleteImage,
    optimizeImage,
    getImage
} from '../controllers/imageController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/:filename', getImage);

// Protected routes
router.use(verifyToken);
router.use(restrictTo('admin'));

router.post('/upload', upload.single('image'), uploadImage);
router.post('/optimize/:filename', optimizeImage);
router.delete('/:filename', deleteImage);

export default router;