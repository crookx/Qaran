const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.post('/', [protect, admin], categoryController.createCategory);
router.put('/:id', [protect, admin], categoryController.updateCategory);
router.delete('/:id', [protect, admin], categoryController.deleteCategory);

module.exports = router;