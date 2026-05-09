const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Đăng ký
exports.register = async (req, res) => {
    try{
        const { username, password, role } = req.body;
        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({username, password: hashedPassword, role});
        res.status(201).json({message: "Đăng ký thành công", user: {username: newUser.username}});
    } catch(error) {
        res.status(400).json({error: "Lỗi đăng ký hoặc username đã tồn tại"});
    }
}

// Đăng nhập
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && bcrypt.compare(password, user.password)) {
        const token =jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2w'});
        res.json({ message: "Đăng nhập thành công!", token });
    } else {
        res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    }
}