//Kiểm tra "thẻ thành viên" JWT trước khi cho vào các Route bí mật
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token nhận được ở server:", token); // Log để kiểm tra token có được gửi lên không
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Lỗi: Header Authorization trống hoặc sai định dạng Bearer");
        return res.status(401).json({ message: "Không có quyền truy cập" });
    }
    if (!token) return res.status(401).json({ message: "Không có quyền truy cập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Token đã được giải mã:", decoded); // Log thông tin user từ token
        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};