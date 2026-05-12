const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. Middlewares (Luôn để trên đầu)
app.use(cors({
  // THAY ĐỔI: Không dùng '*', hãy copy đúng domain Playcode của bạn
  origin: 'https://2687866.preview.playcode.io', 
  
  // QUAN TRỌNG: Phải có dòng này để khớp với với withCredentials của Client
  credentials: true, 
  
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
const bankRouter = require('./routes/bankRoutes');

app.use('/api/bank', bankRouter);
app.use('/api/auth', authRouter);
app.use('/api', profileRouter);

app.get('/', (req, res) => { res.send("Server is Online!") });
// 4. Khởi động
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));