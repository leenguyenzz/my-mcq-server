const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const mcqRouter = require('./routes/mcq');
const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes');
const mongoose = require('mongoose');

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công tới MongoDB!'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/mcq', mcqRouter);
app.use('/api', profileRouter);

app.get('/', (req, res) => {
    res.send("Server is Online!");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));