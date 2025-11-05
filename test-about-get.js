fetch('http://localhost:5000/api/polihub/about-page')
  .then(response => {
    console.log('Status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('Response:', text);
    try {
      const json = JSON.parse(text);
      console.log('\n✅ Parsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\n❌ Failed to parse as JSON');
      console.log('Error:', e.message);
    }
  })
  .catch(error => console.error('Fetch error:', error));
