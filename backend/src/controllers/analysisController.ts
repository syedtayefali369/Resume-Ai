import { Request, Response } from 'express';
import { analyzeJobDescription, analyzeResume, calculateMatch } from '../utils/analyzer.js';

export const analyzeJob = (req: Request, res: Response) => {
  try {
    console.log('Analyze Job: Received request');
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      console.log('Analyze Job: No job description provided');
      return res.status(400).json({ error: 'Job description is required' });
    }

    console.log('Analyze Job: Analyzing...');
    const analysis = analyzeJobDescription(jobDescription);
    console.log('Analyze Job: Analysis complete', analysis);
    
    res.json(analysis);
  } catch (error) {
    console.error('Analyze Job: ERROR:', error);
    res.status(500).json({ error: 'Failed to analyze job description' });
  }
};

export const parseResume = (req: Request, res: Response) => {
  try {
    console.log('Parse Resume: Received request');
    const { resumeText } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const resumeData = analyzeResume(resumeText);
    res.json(resumeData);
  } catch (error) {
    console.error('Parse Resume: ERROR:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
};

export const calculateMatchScore = (req: Request, res: Response) => {
  try {
    const { jobSkills, resumeSkills } = req.body;
    
    if (!jobSkills || !resumeSkills) {
      return res.status(400).json({ error: 'Job skills and resume skills are required' });
    }

    const matchResult = calculateMatch(jobSkills, resumeSkills);
    res.json(matchResult);
  } catch (error) {
    console.error('Calculate Match: ERROR:', error);
    res.status(500).json({ error: 'Failed to calculate match score' });
  }
};

export const improveResumeText = async (req: Request, res: Response) => {
  try {
    const { originalText, jobDescription } = req.body;
    
    if (!originalText || !jobDescription) {
      return res.status(400).json({ error: 'Original text and job description are required' });
    }

    // Import the AI service dynamically to avoid circular dependencies
    const { getAIImprovement } = await import('../services/aiService.js');
    const improvedText = await getAIImprovement(originalText, jobDescription);
    
    res.json({
      original: originalText,
      improved: improvedText,
      changes: [
        'Added action verbs',
        'Quantified results',
        'Used industry-standard terminology'
      ]
    });
  } catch (error) {
    console.error('Improve Resume: ERROR:', error);
    res.status(500).json({ error: 'Failed to improve resume text' });
  }
};