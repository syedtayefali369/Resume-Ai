// Replace the ENTIRE file with this code:

export async function getAIImprovement(originalText: string, jobDescription: string): Promise<string> {
  const token = process.env.HUGGING_FACE_TOKEN;
  
  console.log('AI Service: Starting improvement for:', originalText.substring(0, 50));
  
  // If no token, use manual improvements
  if (!token || token === 'your_copied_token_here') {
    console.log('AI Service: No Hugging Face token found, using manual improvements');
    return improveTextManually(originalText);
  }

  try {
    console.log('AI Service: Calling Hugging Face API...');
    
    // Using a good model for text generation
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Improve this resume bullet point to be more professional. Use action verbs and add numbers if possible.\n\nOriginal: "${originalText}"\n\nJob: ${jobDescription.substring(0, 150)}\n\nImproved:`,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.8,
            return_full_text: false
          }
        }),
      }
    );

    console.log('AI Service: Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('AI Service: Raw API response:', result);
    
    // Extract the improved text from different possible response formats
    let improvedText = '';
    
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      improvedText = result[0].generated_text.trim();
    } else if (result.generated_text) {
      improvedText = result.generated_text.trim();
    } else if (result[0] && result[0].generated_text) {
      improvedText = result[0].generated_text.trim();
    } else {
      console.log('AI Service: Unexpected response format, using manual improvement');
      return improveTextManually(originalText);
    }

    // Clean up the response
    improvedText = improvedText
      .replace(/Improved:\s*/, '')
      .replace(/"/g, '')
      .trim();

    console.log('AI Service: Improved text:', improvedText);
    
    if (!improvedText || improvedText.length < 10) {
      return improveTextManually(originalText);
    }
    
    return improvedText;

  } catch (error) {
    console.error('AI Service: Hugging Face API error:', error);
    return improveTextManually(originalText);
  }
}

// Fallback manual improvements (keeps your app working if API fails)
function improveTextManually(originalText: string): string {
  console.log('AI Service: Using manual improvements');
  
  const improvements: { [key: string]: string } = {
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
    'developed': 'engineered and deployed'
  };

  let improved = originalText;
  
  // Apply text improvements
  Object.entries(improvements).forEach(([bad, good]) => {
    const regex = new RegExp(`\\b${bad}\\b`, 'gi');
    improved = improved.replace(regex, good);
  });

  // Add quantification if missing
  if (!improved.match(/\d+/)) {
    if (improved.includes('developed') || improved.includes('created')) {
      improved += ', serving 1000+ users';
    } else if (improved.includes('optimized') || improved.includes('improved')) {
      improved += ', resulting in 40% performance gain';
    } else if (improved.includes('managed') || improved.includes('led')) {
      improved += ', leading a team of 5 developers';
    } else if (improved.includes('reduced') || improved.includes('decreased')) {
      improved += ' by 30%';
    } else if (improved.includes('increased') || improved.includes('improved')) {
      improved += ' by 50%';
    }
  }

  return improved.charAt(0).toUpperCase() + improved.slice(1);
}