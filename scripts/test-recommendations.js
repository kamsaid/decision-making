/**
 * Test script for the recommendations API
 * Run with: node scripts/test-recommendations.js
 */

const API_URL = 'http://localhost:3000/api/recommendations';

const testData = {
  context: "I'm a software developer with 5 years of experience currently working at a mid-size company. I've been offered a position at a fast-growing startup with equity options but a 10% salary cut. The startup is in the AI/ML space which interests me greatly. I have a family with two young children and a mortgage to consider.",
  preferences: [
    "Career growth and learning opportunities",
    "Work in cutting-edge technology",
    "Long-term financial security",
    "Work-life balance for family time"
  ],
  constraints: [
    "Need to maintain current lifestyle and expenses",
    "Limited savings buffer (3 months)",
    "Spouse works part-time",
    "Children's education fund contributions"
  ]
};

async function testRecommendations() {
  console.log('🚀 Testing recommendations API with enhanced token limits...\n');
  console.log('📝 Test Context:', testData.context.slice(0, 100) + '...\n');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Response time: ${duration}ms\n`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check if response is properly formed
    console.log('✅ Response structure:');
    console.log('  - Has analysis:', !!result.analysis);
    console.log('  - Has finalRecommendation:', !!result.finalRecommendation);
    console.log('  - Worker statuses:', result.analysis?.workerStatus?.map(w => 
      `${w.type}: ${w.success ? '✓' : '✗'}`
    ).join(', ') || 'N/A');
    
    // Check for truncation indicators
    const recommendation = result.finalRecommendation;
    if (recommendation) {
      console.log('\n📊 Content analysis:');
      console.log('  - Summary length:', recommendation.summary?.length || 0, 'chars');
      console.log('  - Reasoning length:', recommendation.reasoning?.length || 0, 'chars');
      console.log('  - Key points:', recommendation.keyPoints?.length || 0);
      console.log('  - Next steps:', recommendation.nextSteps?.length || 0);
      console.log('  - Resources:', recommendation.resources?.length || 0);
      
      // Check for potential truncation
      const checkTruncation = (text) => {
        if (!text) return false;
        // Common truncation patterns
        return text.endsWith('...') || 
               text.endsWith('..') || 
               text.endsWith('.."') ||
               text.endsWith(',"') ||
               !text.match(/[.!?]"?$/);
      };
      
      console.log('\n🔍 Truncation check:');
      console.log('  - Summary:', checkTruncation(recommendation.summary) ? '⚠️ Possibly truncated' : '✓ Complete');
      console.log('  - Reasoning:', checkTruncation(recommendation.reasoning) ? '⚠️ Possibly truncated' : '✓ Complete');
      
      // Display sample content
      console.log('\n📄 Sample output:');
      console.log('Summary:', recommendation.summary?.slice(0, 150) + '...');
      console.log('\nFirst key point:', recommendation.keyPoints?.[0] || 'None');
      console.log('First next step:', recommendation.nextSteps?.[0] || 'None');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testRecommendations(); 