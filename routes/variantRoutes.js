import express from 'express';
import {
    getVariants,
    getVariant,
    createVariant,
    updateVariant,
    deleteVariant
} from '../controllers/variantController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// Protect all variant routes
router.use(verifyToken);
router.use(restrictTo('admin'));

router.get('/', getVariants);
router.get('/:id', getVariant);
router.post('/', upload.array('images', 5), createVariant);
router.patch('/:id', upload.array('images', 5), updateVariant);
router.delete('/:id', deleteVariant);

export default router;