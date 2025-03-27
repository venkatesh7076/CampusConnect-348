const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// GET all items
router.get('/', itemController.getItems);

// GET single item
router.get('/:id', itemController.getItem);

// POST new item
router.post('/', itemController.createItem);

// PUT update item
router.put('/:id', itemController.updateItem);

// DELETE item
router.delete('/:id', itemController.deleteItem);

module.exports = router;