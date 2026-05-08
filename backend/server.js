require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL || '*'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));

// Auth/Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Basic validation
  if (!username || !password) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }

  // Generate a base64 token just like the Python backend did
  const payload = { username, role: 'hr' };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');

  res.json({ 
    success: true, 
    data: {
      token,
      username,
      role: 'hr'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 HR Recruiter API is running!' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
