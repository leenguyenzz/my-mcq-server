const express = require('express');
const router = express.Router();
const { deposit, withdraw, transfer, getBalance } = require('../controllers/bankController');
const { protect } = require('../middleware/authMiddleware');

router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw);
router.post('/transfer', protect, transfer);
router.get('/balance/:accountNumber', protect, getBalance);

module.exports = router;