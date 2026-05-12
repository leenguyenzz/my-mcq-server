//Kiểm tra "thẻ thành viên" JWT trước khi cho vào các Route bí mật
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    // 1. Log để xem headers thực tế
    console.log("Headers nhận được:", req.headers);
    // 2. Kiểm tra nếu header hoàn toàn không tồn tại
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Lỗi: Header Authorization trống hoặc sai định dạng Bearer");
        return res.status(401).json({ message: "Không có quyền truy cập" });
    }
    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};