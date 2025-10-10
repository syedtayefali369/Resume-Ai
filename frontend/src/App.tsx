import React, { useState } from 'react';
import { JobAnalysis, ResumeData, MatchResult, ImprovementResult } from './types';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [improvement, setImprovement] = useState<ImprovementResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const analyzeJob = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });
      const data: JobAnalysis = await response.json();
      setAnalysis(data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error analyzing job:', error);
      alert('Failed to analyze job description');
    }
    setLoading(false);
  };

  const analyzeResume = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      const data: ResumeData = await response.json();
      setResumeData(data);

      // Calculate match score
      if (analysis) {
        const matchResponse = await fetch('/api/calculate-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobSkills: analysis.skills,
            resumeSkills: data.skills
          })
        });
        const matchData: MatchResult = await matchResponse.json();
        setMatchResult(matchData);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume');
    }
    setLoading(false);
  };

  const getImprovement = async (): Promise<void> => {
    if (!analysis) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/improve-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: "Built web applications using React and JavaScript",
          jobDescription: jobDescription
        })
      });
      const data: ImprovementResult = await response.json();
      setImprovement(data);
    } catch (error) {
      console.error('Error getting improvement:', error);
      alert('Failed to get AI improvement');
    }
    setLoading(false);
  };

  const resetApp = (): void => {
    setCurrentStep(1);
    setJobDescription('');
    setResumeText('');
    setAnalysis(null);
    setResumeData(null);
    setMatchResult(null);
    setImprovement(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ResumeAI</h1>
            </div>
            <button
              onClick={resetApp}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Job Description */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-2xl font-semibold ml-4">Paste Job Description</h2>
            </div>
            
            <textarea
              value={jobDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here... We'll analyze the key requirements and skills needed."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex justify-between items-center mt-6">
              <span className="text-gray-500">We'll identify key skills and requirements</span>
              <button
                onClick={analyzeJob}
                disabled={!jobDescription.trim() || loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Job Description'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Resume Analysis */}
        {currentStep === 2 && analysis && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-2xl font-semibold ml-4">Upload Your Resume</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              {/* Job Analysis Results */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">📋 Job Requirements</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Key Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Technologies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.technologies.map((tech, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">📄 Your Resume</h3>
                <textarea
                  value={resumeText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here... (You can copy-paste from your resume file)"
                  className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
              >
                ← Back
              </button>
              <button
                onClick={analyzeResume}
                disabled={!resumeText.trim() || loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Match'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && matchResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h2 className="text-2xl font-semibold ml-4">Your Resume Analysis</h2>
            </div>

            {/* Match Score */}
            <div className="text-center mb-8">
              <div className="inline-flex flex-col items-center">
                <div className={`text-5xl font-bold mb-2 ${
                  matchResult.score >= 80 ? 'text-green-600' :
                  matchResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {matchResult.score}%
                </div>
                <div className="text-gray-600">ATS Match Score</div>
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">✅ Your Strong Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.matches.map((skill, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">⚠️ Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missing.map((skill, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">💡 Improvement Suggestions</h3>
              <ul className="space-y-2 text-gray-700">
                {matchResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Improvements */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">🤖 AI-Powered Rewrites</h3>
              
              {improvement ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2"><strong>Original:</strong> {improvement.original}</p>
                    <p className="text-green-700 font-medium"><strong>Improved:</strong> {improvement.improved}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {improvement.changes.map((change, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {change}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Get AI-powered suggestions to improve your resume bullet points</p>
                  <button
                    onClick={getImprovement}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Get AI Suggestions'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;