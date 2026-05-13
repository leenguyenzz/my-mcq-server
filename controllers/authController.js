const User = require('../models/User');
const Bank = require('../models/Bank');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Đăng ký
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Kiểm tra username đã tồn tại chưa
        const user = await User.findOne({ username });
        if (user) {
            // Trả về 409 Conflict cho lỗi trùng dữ liệu
            return res.status(409).json({ error: "Username đã tồn tại" });
        }

        // 2. Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Tạo user mới
        const newUser = await User.create({ username, password: hashedPassword });

        // 4. Tạo tài khoản ngân hàng cho người dùng mới
        // Hàm tạo số tài khoản ngẫu nhiên
        const generateAccountNumber = () => {
            return Math.floor(1000000000 + Math.random() * 9000000000).toString();
        };
        await Bank.create({ userId: newUser._id, accountNumber: generateAccountNumber(), accountHolder: newUser.username, balance: 0 });

        res.status(201).json({ 
            message: "Đăng ký thành công", 
            user: { username: newUser.username } 
        });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        // Trả về 500 nếu là lỗi server (ví dụ mất kết nối DB)
        res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại sau" });
    }
}

// Đăng nhập
exports.login = async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && bcrypt.compare(password, user.password)) {
            // 1. Tạo Access Token (Ngắn hạn - 15 phút)
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1m' });
            
            // 2. Tạo Refresh Token (Dài hạn - 7 ngày)
            const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
            
            // 3. LƯU refreshToken VÀO DATABASE
            user.refreshToken = refreshToken; 
            await user.save();
            
            // 4. Lưu Refresh Token vào Cookie (HttpOnly & SameSite)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // true nếu dùng https
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            // 4. Trả Access Token về cho Frontend
            res.json({ message: "Đăng nhập thành công!", accessToken });
        } else {
            res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
        }
    } catch (error){
        console.error("Lỗi chi tiết:", error); // Dòng này sẽ hiện ở Render Logs
        res.status(500).json({ 
            error: 'Lỗi Server', 
            detail: error.message // Gửi tin nhắn lỗi thực tế về cho Playcode thấy
        });
    }
}

// Làm mới Access Token khi hết hạn
exports.refreshToken = async (req, res) => {
    try {
        // Lấy refreshToken từ cookie (cần cài cookie-parser)
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(401).json("Bạn chưa đăng nhập!");

        // Tìm user sở hữu token này trong DB
        const userInDb = await User.findOne({ refreshToken });
        if(!userInDb) return res.status(401).json("Token không hợp lệ hoặc đã bị thu hồi!");

        // Xác minh Refresh Token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) res.status(401).json("Token hết hạn!");

            //Nếu hợp lệ, cấp Access Token mới
            const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1m' });
            
            res.json({ accessToken: newAccessToken });
        });
    } catch (err) {
        res.status(500).json("Lỗi hệ thống");
    }
}

// Hàm mới: Đăng xuất
exports.logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    // Tìm user đang sở hữu token này và xóa trắng trường refreshToken
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });

    // Xóa cookie refreshToken
    res.clearCookie('refreshToken');
    res.json({ message: "Đăng xuất thành công!" });
};