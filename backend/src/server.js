require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .catch((err) => console.error('MongoDB connection failed:', err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
