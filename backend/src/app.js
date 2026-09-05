const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const questionRoutes = require('./routes/questionRoutes');
const assessRoutes = require('./routes/assessRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assess', assessRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
