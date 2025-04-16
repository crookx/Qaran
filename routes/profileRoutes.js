import express from 'express';
import {
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
    deleteAvatar,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} from '../controllers/profileController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// All profile routes require authentication
router.use(verifyToken);

// Profile routes
router.get('/', getProfile);
router.patch('/update', updateProfile);
router.patch('/password', updatePassword);
router.post('/avatar', upload.single('avatar'), handleMulterError, uploadAvatar);
router.delete('/avatar', deleteAvatar);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.patch('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;