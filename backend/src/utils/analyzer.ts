import { JobAnalysis, ResumeData, MatchResult } from '../types/index.js';

export function analyzeJobDescription(jobDescription: string): JobAnalysis {
  const skills = extractSkills(jobDescription);
  const technologies = extractTechnologies(jobDescription);
  
  return {
    skills,
    technologies,
    experience: extractExperience(jobDescription),
    qualifications: extractQualifications(jobDescription)
  };
}

export function analyzeResume(resumeText: string): ResumeData {
  return {
    skills: extractSkills(resumeText),
    experience: extractExperience(resumeText),
    education: extractEducation(resumeText),
    projects: extractProjects(resumeText)
  };
}

export function calculateMatch(jobSkills: string[], resumeSkills: string[]): MatchResult {
  const matches = jobSkills.filter(jobSkill =>
    resumeSkills.some(resumeSkill =>
      resumeSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  );

  const score = Math.round((matches.length / jobSkills.length) * 100);
  
  return {
    score,
    matches,
    missing: jobSkills.filter(skill => !matches.includes(skill)),
    improvements: generateImprovements(matches, jobSkills)
  };
}

// Helper functions
function extractSkills(text: string): string[] {
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue', 
    'node.js', 'express', 'mongodb', 'sql', 'aws', 'docker', 'git', 'html', 'css',
    'rest api', 'graphql', 'jest', 'cypress', 'webpack', 'babel'
  ];
  return commonSkills.filter(skill => text.toLowerCase().includes(skill));
}

function extractTechnologies(text: string): string[] {
  const technologies = [
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'jenkins', 'github actions'
  ];
  return technologies.filter(tech => text.toLowerCase().includes(tech));
}

function extractExperience(text: string): string {
  const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
  return expMatch ? expMatch[0] : 'Not specified';
}

function extractQualifications(text: string): string[] {
  const qualifications = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certification'];
  return qualifications.filter(qual => text.toLowerCase().includes(qual));
}

function extractEducation(text: string): string[] {
  const educationKeywords = ['university', 'college', 'institute', 'bachelor', 'master', 'phd'];
  return educationKeywords.filter(edu => text.toLowerCase().includes(edu));
}

function extractProjects(text: string): string[] {
  // Simple project extraction - in real app, use more sophisticated parsing
  return ['Project experience detected'];
}

function generateImprovements(matches: string[], jobSkills: string[]): string[] {
  const missingCount = jobSkills.length - matches.length;
  return [
    `Add ${missingCount} missing keywords from job description`,
    'Use more action verbs like "developed", "implemented", "optimized"',
    'Quantify achievements with numbers and metrics',
    'Focus on results and impact rather than responsibilities'
  ];
}