const User = require('../models/User');
const Bank = require('../models/Bank');


exports.deposit = (req, res) => {
    const userId = req.user.id; // Giả sử bạn đã có middleware xác thực và gắn user vào req
    const { amount } = req.body;
    // Logic để xử lý nạp tiền vào tài khoản
    Bank.findOneAndUpdate({ id: userId }, { $inc: { balance: amount } }, { new: true })
        .then(bank => {
            res.json({ message: `Đã nạp ${amount} vào tài khoản!`, balance: bank.balance });
        })
        .catch(err => {
            res.status(500).json({ error: 'Lỗi hệ thống' });
        });
}

exports.withdraw = (req, res) => {
    const { amount } = req.body;
    // Logic để xử lý rút tiền từ tài khoản
    res.json({ message: `Đã rút ${amount} từ tài khoản!` });
}

exports.transfer = (req, res) => {
    const { amount, toAccount } = req.body;
    // Logic để xử lý chuyển tiền đến tài khoản khác
    res.json({ message: `Đã chuyển ${amount} đến tài khoản ${toAccount}!` });
}

exports.getBalance = (req, res) => {
    const { accountNumber } = req.params;
    // Logic để lấy số dư tài khoản
    res.json({ message: `Số dư tài khoản ${accountNumber} là 1000000 VND.` });
}  