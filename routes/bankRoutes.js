const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const bankLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
});

const { deposit, withdraw, transfer, getBalance } = require('../controllers/bankController');
const { protect } = require('../middleware/authMiddleware');

router.post('/deposit', protect, bankLimiter, deposit);
router.post('/withdraw', protect, bankLimiter, withdraw);
router.post('/transfer', protect, bankLimiter, transfer);
router.get('/balance', protect, bankLimiter, getBalance);

module.exports = router;