export interface JobAnalysis {
  skills: string[];
  technologies: string[];
  experience: string;
  qualifications: string[];
}

export interface ResumeData {
  skills: string[];
  experience: string;
  education: string[];
  projects: string[];
}

export interface MatchResult {
  score: number;
  matches: string[];
  missing: string[];
  improvements: string[];
}

export interface ATSCheck {
  score: number;
  issues: string[];
  suggestions: string[];
}