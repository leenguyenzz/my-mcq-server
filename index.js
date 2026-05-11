const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. Middlewares (Luôn để trên đầu)
const allowedOrigins = [
  'https://2687866.preview.playcode.io',
  'http://localhost:5173', // Nếu bạn test máy cục bộ
];

app.use(cors({
  origin: 'https://2687866.preview.playcode.io', // Copy chính xác domain đang chạy của bạn
  credentials: true, // Cho phép gửi kèm cookie/token
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// 2. Kết nối DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công tới MongoDB!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// 3. Routes
const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes');
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);

app.get('/', (req, res) => { res.send("Server is Online!") });
// 4. Khởi động
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));