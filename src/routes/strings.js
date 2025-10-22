const express = require('express');
const StringController = require('../controllers/stringController');

const router = express.Router();

router.post('/', StringController.createString);
router.get('/filter-by-natural-language', StringController.filterByNaturalLanguage);
router.get('/:string_value', StringController.getString);
router.delete('/:string_value', StringController.deleteString);
router.get('/', StringController.getALLStrings);

module.exports = router;