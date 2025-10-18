const axios = require('axios');

async function testModulesAPI() {
  try {
    const response = await axios.get('http://localhost:3000/api/learning/modules');
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.modules) {
      console.log('\n=== MODULES BREAKDOWN ===');
      console.log('Total modules:', response.data.modules.length);

      const published = response.data.modules.filter(m => m.is_published);
      console.log('Published modules:', published.length);

      const featured = published.filter(m => m.is_featured);
      console.log('Featured & Published modules:', featured.length);

      console.log('\n=== FEATURED MODULES ===');
      featured.forEach(m => {
        console.log(`- ${m.title} (progress: ${m.progress_percentage || 0}%)`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testModulesAPI();
