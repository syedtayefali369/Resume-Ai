export async function getAIImprovement(originalText: string, jobDescription: string): Promise<string> {
  const token = process.env.HUGGING_FACE_TOKEN;
  
  // If no token, use manual improvements
  if (!token) {
    return improveTextManually(originalText);
  }

  try {
    // Using Microsoft's DialoGPT model - FREE
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: `Improve this resume bullet point to be more professional and impactful. Use action verbs and quantify results if possible.\n\nOriginal: "${originalText}"\n\nJob Context: ${jobDescription.substring(0, 200)}\n\nImproved version:`,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle different response formats from Hugging Face
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      return result[0].generated_text.trim();
    } else if (result.generated_text) {
      return result.generated_text.trim();
    } else {
      console.log('Unexpected response format:', result);
      return improveTextManually(originalText);
    }
  } catch (error) {
    console.error('Hugging Face API error:', error);
    return improveTextManually(originalText);
  }
}

// Fallback manual improvements
function improveTextManually(originalText: string): string {
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
    'created': 'designed and developed'
  };

  let improved = originalText.toLowerCase();
  
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
    }
  }

  return improved.charAt(0).toUpperCase() + improved.slice(1);
}