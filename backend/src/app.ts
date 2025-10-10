import express from 'express';
import cors from 'cors';
import { analyzeJob, parseResume, calculateMatchScore, improveResumeText } from './controllers/analysisController.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/analyze-job', analyzeJob);
app.post('/api/parse-resume', parseResume);
app.post('/api/calculate-match', calculateMatchScore);
app.post('/api/improve-resume', improveResumeText);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Resume AI Tool API is running' });
});

export default app;