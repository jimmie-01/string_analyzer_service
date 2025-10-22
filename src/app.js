const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const stringRoutes = require('./routes/strings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb'}));

// Routes
app.use('/strings', stringRoutes);

// Error handling middleware
app.use((err, req, res) => {
	console.error('Unhandle error:', err);
	res.status(500).json({ error: 'Inernat server error' });
});

//404 handler
app.use("*", (req, res) => {
	res.status(404).json({ erro: 'Endpoint not found' })
});

app.listen(PORT, () => {
	console.log(`String Analyzer Service running on port ${PORT}`);
});

module.exports = app;