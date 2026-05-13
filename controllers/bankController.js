const User = require('../models/User');
const Bank = require('../models/Bank');


exports.deposit = (req, res) => {
    const userId = req.user.id; // Giả sử bạn đã có middleware xác thực và gắn user vào req
    const { amount } = req.body;
    // Logic để xử lý nạp tiền vào tài khoản
    Bank.findOneAndUpdate({ userId: userId }, { $inc: { balance: amount } }, { new: true })
        .then(bank => {
            res.json({ message: `Đã nạp ${amount} vào tài khoản!`, balance: bank.balance });
        })
        .catch(err => {
            res.status(500).json({ error: 'Lỗi hệ thống' });
        });
}

exports.withdraw = async (req, res) => {
    const userId = req.user.id; // Giả sử bạn đã có middleware xác thực và gắn user vào req
    const { amount } = req.body;
    // Logic để xử lý rút tiền từ tài khoản
    const balance = await Bank.findOne({ userId: userId }).then(bank => bank.balance);
    if (balance < amount) {
        return res.status(400).json({ error: 'Số dư không đủ để rút!' });
    }
    await Bank.findOneAndUpdate({ userId: userId }, { $inc: { balance: -amount } }, { new: true })
        .then(bank => {
            res.json({ message: `Đã rút ${amount} từ tài khoản!`, balance: bank.balance });
        })
        .catch(err => {
            res.status(500).json({ error: 'Lỗi hệ thống' });
        });
}

exports.transfer = async (req, res) => {
    const userId = req.user.id; // Giả sử bạn đã có middleware xác thực và gắn user vào req
    const { amount, toAccount } = req.body;
    // Logic để xử lý chuyển tiền đến tài khoản khác
    await User.findOne({ accountNumber: toAccount }).then(recipient => {
        if (!recipient) {
            return res.status(404).json({ error: 'Tài khoản người nhận không tồn tại!' });
        }
        const balance = await Bank.findOne({ userId: userId }).then(bank => bank.balance);
        if (balance < amount) {
            return res.status(400).json({ error: 'Số dư không đủ để chuyển!' });
        }
        await transferMoney(userId, toAccount, amount);
    }).catch(err => {
        res.status(500).json({ error: 'Lỗi hệ thống' });
    });
}

const transferMoney = async (userId, toAccount, amount) => {
    // Trừ tiền từ tài khoản người gửi và cộng tiền vào tài khoản người nhận
    await Bank.findOneAndUpdate({ userId: userId }, { $inc: { balance: -amount } }, { new: true })
        .then(async bank => {
            // Sau khi trừ tiền từ tài khoản người gửi, cộng tiền vào tài khoản người nhận
            await Bank.findOneAndUpdate({ accountNumber: toAccount }, { $inc: { balance: amount } }, { new: true })
                .then(async bank => {
                    res.json({ message: `Đã chuyển ${amount} đến tài khoản ${toAccount}!` });
                })
                .catch(err => {
                    res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật tài khoản người nhận' });
                });
        })
        .catch(err => {
            res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật tài khoản người gửi' });
        });
    // res.json({ message: `Đã chuyển ${amount} đến tài khoản ${toAccount}!` }); // This line is redundant and should be removed
}

exports.getBalance = async (req, res) => {
    const userId = req.user.id; // Giả sử bạn đã có middleware xác thực và gắn user vào req
    // Logic để lấy số dư tài khoản
    await Bank.findOne({ userId: userId }).then(bank => {
        if (!bank) {
            return res.status(404).json({ error: 'Tài khoản không tồn tại!' });
        }
        res.json({ balance: bank.balance });
    }).catch(err => {
        res.status(500).json({ error: 'Lỗi hệ thống' });
    });
}  