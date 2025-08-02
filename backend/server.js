const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const birdRoutes = require('./routes/bird');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Import cron jobs
const { autoCollectEggs, updateBirdLifespan } = require('./utils/cronJobs');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Initialize default admin and settings
  require('./utils/seeders')();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
console.log('Setting up routes...');
app.use('/api/auth', authRoutes);
console.log('Auth routes set up');
app.use('/api/user', userRoutes);
console.log('User routes set up');
app.use('/api/birds', birdRoutes);
console.log('Bird routes set up');
app.use('/api/payment', paymentRoutes);
console.log('Payment routes set up');
app.use('/api/admin', adminRoutes);
console.log('Admin routes set up');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Start cron jobs
cron.schedule('*/10 * * * *', autoCollectEggs); // Every 10 minutes
cron.schedule('0 0 * * *', updateBirdLifespan); // Daily at midnight

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});