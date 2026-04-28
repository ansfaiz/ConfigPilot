const express = require('express');
const { getRecords, createRecord, updateRecord, deleteRecord } = require('../controllers/dataController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(auth);

router.get('/', getRecords);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
