const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/user');
const mcqRouter = require('./routes/mcq');
const mongoose = require('mongoose');

app.use(cors());
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công tới MongoDB!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

app.use(express.json());

app.use('/users', userRouter);
app.use('/mcq', mcqRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));