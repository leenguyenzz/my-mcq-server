const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware');

router.get('/profile', protect, (req, res) => {
    res.status(200).json({ message: "Đây là dữ liệu bí mật!", user: req.user });
})

module.exports = router;