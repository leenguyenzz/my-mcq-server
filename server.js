const express = require('express');
const app = express();
const PORT = 3000;

app.get('/test-get', (req, res) => {
    // Trả về một object JSON để bạn thấy kết quả rõ nhất
    res.status(200).json({
        message: "Bạn đã gọi GET thành công!",
        time: new Date().toLocaleString(),
        status: "Active"
    });
});
app.get('/getAPI', (req,res)=> {
    const {name} = req.query;
    res.send(`Chào ${name}! Tôi đã nhận được thông tin bạn gửi lên server.`);
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});