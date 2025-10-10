// Free AI service using Cohere API
export async function getAIImprovement(originalText: string, jobDescription: string): Promise<string> {
  try {
    // For now, return a simple improvement without API call
    // You can add Cohere API later: https://dashboard.cohere.com/
    return improveTextManually(originalText);
  } catch (error) {
    console.error('AI service error:', error);
    return improveTextManually(originalText);
  }
}

function improveTextManually(originalText: string): string {
  const improvements: { [key: string]: string } = {
    'built': 'developed and launched',
    'worked on': 'spearheaded development of',
    'responsible for': 'managed and delivered',
    'made': 'created and implemented',
    'did': 'executed and optimized'
  };

  let improved = originalText.toLowerCase();
  Object.entries(improvements).forEach(([bad, good]) => {
    improved = improved.replace(new RegExp(bad, 'gi'), good);
  });

  // Add quantification if missing
  if (!improved.match(/\d+/)) {
    improved += ', resulting in 40% performance improvement';
  }

  return improved.charAt(0).toUpperCase() + improved.slice(1);
}