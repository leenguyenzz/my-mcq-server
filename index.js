const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100 // giới hạn mỗi IP
});

// 1. Middlewares (Luôn để trên đầu)
app.use(cors({
  // THAY ĐỔI: Không dùng '*', hãy copy đúng domain Playcode của bạn
  origin: 'https://2687866.preview.playcode.io', 
  
  // QUAN TRỌNG: Phải có dòng này để khớp với với withCredentials của Client
  credentials: true, 
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.use(limiter);
app.use(express.json());
app.use(cookieParser());
// Chế độ 'dev' sẽ cho ra các dòng log có màu sắc, dễ nhìn
app.use(morgan('dev'));

// 2. Kết nối DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công tới MongoDB!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// 3. Routes
const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes');
const bankRouter = require('./routes/bankRoutes');

app.use('/api/bank', bankRouter);
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);

app.get('/', (req, res) => { res.send("Server is Online!") });
// 4. Khởi động
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));