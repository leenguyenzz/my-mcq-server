//Kiểm tra "thẻ thành viên" JWT trước khi cho vào các Route bí mật
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};
// Middleware nhận vào mảng các roles được phép (ví dụ: ['admin', 'editor'])
exports.authorize = (allowedRoles) => {
    return async (req, res, next) => {
        const user = await User.findById(req.user.id);
        // req.user được tạo ra từ middleware authenticate ở trên
        if (!req.user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ 
                message: "Bạn không có quyền truy cập vào chức năng này" , 
            });
        }
        next(); // Quyền hợp lệ, cho phép đi tiếp
    };
};