const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { NODE_ENV } = require('./services/config');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3333;

if (NODE_ENV === 'development') {
  console.warn('Warning: Running in development mode. Make sure to set JWT_SECRET and NODE_ENV=production in production environments.');
}

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Using default development secret key.');
}

app.set('trust proxy', 1);

if (NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://frontend:5173'],
    credentials: true
  }));
}

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${ PORT }`);
});
