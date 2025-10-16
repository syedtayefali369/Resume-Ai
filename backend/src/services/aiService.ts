export async function getAIImprovement(originalText: string, jobDescription: string): Promise<string> {
  const token = process.env.HUGGING_FACE_TOKEN;
  
  console.log('AI Service: Starting improvement for:', originalText.substring(0, 50));
  console.log('AI Service: Token exists:', !!token);
  
  // If no token or default token, use manual improvements
  if (!token || token === 'your_copied_token_here' || token.startsWith('hf_') === false) {
    console.log('AI Service: No valid Hugging Face token found, using manual improvements');
    return improveTextManually(originalText, jobDescription);
  }

  try {
    console.log('AI Service: Calling Hugging Face API...');
    
    // Better prompt for resume improvement
    const prompt = `
Please improve this resume bullet point to be more professional and impactful. Use strong action verbs and quantify results where possible.

Original: "${originalText}"
Job Description Context: ${jobDescription.substring(0, 200)}

Improved version:`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        }),
      }
    );

    console.log('AI Service: Response status:', response.status);
    console.log('AI Service: Response headers:', response.headers);

    if (response.status === 503) {
      console.log('AI Service: Model is loading, please wait...');
      return improveTextManually(originalText, jobDescription);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Service: API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('AI Service: Full API response:', JSON.stringify(result, null, 2));
    
    // Extract the improved text from different possible response formats
    let improvedText = extractGeneratedText(result);
    
    if (!improvedText || improvedText.length < 10) {
      console.log('AI Service: No valid text generated, using manual improvement');
      return improveTextManually(originalText, jobDescription);
    }

    // Clean up the response
    improvedText = cleanGeneratedText(improvedText);
    console.log('AI Service: Final improved text:', improvedText);
    
    return improvedText;

  } catch (error) {
    console.error('AI Service: API call failed:', error);
    return improveTextManually(originalText, jobDescription);
  }
}

// Helper function to extract text from different response formats
function extractGeneratedText(result: any): string {
  if (Array.isArray(result)) {
    if (result[0]?.generated_text) {
      return result[0].generated_text;
    }
    return result[0] || '';
  } else if (result.generated_text) {
    return result.generated_text;
  } else if (result[0]?.generated_text) {
    return result[0].generated_text;
  }
  return '';
}

// Helper function to clean the generated text
function cleanGeneratedText(text: string): string {
  return text
    .replace(/Improved version:\s*/gi, '')
    .replace(/^(?:")?(.*?)(?:")?$/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Enhanced manual improvements with job description context
function improveTextManually(originalText: string, jobDescription: string): string {
  console.log('AI Service: Using enhanced manual improvements');
  
  const actionVerbs: { [key: string]: string } = {
    'built': 'developed and launched',
    'worked on': 'spearheaded development of',
    'responsible for': 'managed and delivered',
    'made': 'created and implemented',
    'did': 'executed and optimized',
    'helped': 'contributed to',
    'used': 'utilized',
    'fixed': 'resolved and debugged',
    'tested': 'validated and tested',
    'wrote': 'authored and implemented',
    'created': 'designed and developed',
    'managed': 'led and coordinated',
    'developed': 'engineered and deployed',
    'analyzed': 'analyzed and interpreted',
    'designed': 'architected and designed',
    'implemented': 'implemented and integrated',
    'maintained': 'maintained and optimized'
  };

  let improved = originalText.toLowerCase();
  
  // Apply text improvements
  Object.entries(actionVerbs).forEach(([weak, strong]) => {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    improved = improved.replace(regex, strong);
  });

  // Add context-aware improvements based on job description
  improved = addQuantification(improved, jobDescription);
  improved = addJobRelevantSkills(improved, jobDescription);

  // Capitalize first letter
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);

  return improved;
}

// Smart quantification based on content
function addQuantification(text: string, jobDescription: string): string {
  if (text.match(/\d+/)) return text; // Already has numbers

  const quantifiers = [
    { pattern: /developed|created|built/, addition: ', serving 1000+ users' },
    { pattern: /optimized|improved|enhanced/, addition: ', resulting in 40% performance improvement' },
    { pattern: /managed|led|directed/, addition: ', leading a team of 5+ members' },
    { pattern: /reduced|decreased|lowered/, addition: ' by 30%' },
    { pattern: /increased|improved|grew/, addition: ' by 50%' },
    { pattern: /analyzed|processed/, addition: ', handling 10,000+ data points' },
    { pattern: /automated|streamlined/, addition: ', saving 10 hours weekly' }
  ];

  for (const { pattern, addition } of quantifiers) {
    if (pattern.test(text) && !text.includes(addition)) {
      return text + addition;
    }
  }

  // Default quantification
  if (!text.includes('%') && !text.match(/\d+/)) {
    return text + ', achieving significant measurable results';
  }

  return text;
}

// Add job-relevant skills if mentioned in job description
function addJobRelevantSkills(text: string, jobDescription: string): string {
  const jobDesc = jobDescription.toLowerCase();
  const skills = [];

  if (jobDesc.includes('react') && !text.includes('react')) skills.push('React');
  if (jobDesc.includes('node') && !text.includes('node')) skills.push('Node.js');
  if (jobDesc.includes('python') && !text.includes('python')) skills.push('Python');
  if (jobDesc.includes('aws') && !text.includes('aws')) skills.push('AWS');
  if (jobDesc.includes('cloud') && !text.includes('cloud')) skills.push('cloud technologies');
  if (jobDesc.includes('api') && !text.includes('api')) skills.push('REST APIs');
  if (jobDesc.includes('database') && !text.includes('database')) skills.push('database management');

  if (skills.length > 0 && !text.includes(skills[0])) {
    return text + ` using ${skills.slice(0, 2).join(' and ')}`;
  }

  return text;
}