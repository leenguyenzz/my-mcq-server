const User = require('../models/User');
const Bank = require('../models/Bank');
const mongoose = require('mongoose');


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
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Số tiền rút không hợp lệ!' });
        }

        // Tìm và cập nhật ngay lập tức nếu thỏa mãn điều kiện balance >= amount
        const updatedBank = await Bank.findOneAndUpdate(
            { 
                userId: userId, 
                balance: { $gte: amount } // CHỈ thực hiện nếu số dư đủ
            }, 
            { 
                $inc: { balance: -amount } // Trừ tiền trực tiếp ở DB
            }, 
            { new: true } // Trả về kết quả sau khi cập nhật
        );

        if (!updatedBank) {
            // Nếu không tìm thấy bank hoặc số dư không đủ, updatedBank sẽ là null
            return res.status(400).json({ error: 'Số dư không đủ hoặc tài khoản không tồn tại!' });
        }

        res.json({ 
            message: `Đã rút ${amount} thành công!`, 
            balance: updatedBank.balance 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
}
exports.transfer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, toAccount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Số tiền không hợp lệ!' });
        }

        // Gọi hàm xử lý giao dịch
        const result = await transferMoney(userId, toAccount, amount);

        res.json({ 
            message: `Đã chuyển ${amount} đến tài khoản ${toAccount} thành công!`,
            newBalance: result.senderBalance 
        });
    } catch (err) {
        // Bắt các lỗi được throw từ transferMoney (ví dụ: không đủ tiền, sai STK)
        res.status(400).json({ error: err.message || 'Lỗi hệ thống' });
    }
}

const transferMoney = async (userId, toAccount, amount) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // 1. Trừ tiền người gửi VÀ kiểm tra số dư cùng lúc (Atomic)
        const sender = await Bank.findOneAndUpdate(
            { userId: userId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session, new: true }
        );

        if (!sender) {
            throw new Error('Số dư không đủ hoặc tài khoản gửi không tồn tại');
        }

        // 2. Cộng tiền người nhận
        const recipient = await Bank.findOneAndUpdate(
            { accountNumber: toAccount },
            { $inc: { balance: amount } },
            { session, new: true }
        );

        if (!recipient) {
            throw new Error('Tài khoản người nhận không tồn tại');
        }

        // 3. (Optional) Ghi log giao dịch tại đây nếu có collection Transactions
        // await Transaction.create([{ from: userId, to: toAccount, amount }], { session });

        await session.commitTransaction();
        return { senderBalance: sender.balance };
    } catch (error) {
        await session.abortTransaction();
        throw error; 
    } finally {
        session.endSession();
    }
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