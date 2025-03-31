const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const itemRoutes = require('./routes/items');
const clubRoutes = require('./routes/clubs');
const eventRoutes = require('./routes/events'); // Add this line

app.use('/api/items', itemRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes); // Add this line

// Basic route for testing
app.get('/', (req, res) => {
  res.send('MERN API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});