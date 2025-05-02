// index.js
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import githubRoutes from './routes/github.js';  // Ensure the correct path

// Load env vars
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/webhook', githubRoutes);

app.get('/', (req, res) => {
  res.send('PR Buddy AI is running.');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error..', details: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// https://pr-buddy-ai.onrender.com/webhook