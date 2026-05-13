const express = require('express');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // giới hạn mỗi IP
  message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau!'
});

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { register, login, logout, refreshToken, deleteUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/refreshToken', refreshToken);
router.post('/delete', protect, authorize(['admin']), deleteUser);

module.exports = router;