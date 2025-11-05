const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/polihub/about-page',
  method: 'GET'
};

console.log('🔍 Testing GET /api/polihub/about-page...\n');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));

      if (json.success && json.data) {
        console.log('\n✅ API is working! Data loaded successfully.');
        console.log(`   Hero Title: ${json.data.hero?.title}`);
        console.log(`   Mission: ${json.data.mission?.text?.substring(0, 50)}...`);
      } else if (json.success && json.data === null) {
        console.log('\n⚠️  API returns success but data is null - table might be empty');
      } else {
        console.log('\n❌ API returned error:', json.error);
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Response is not valid JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\nIs your server running on port 5000?');
});

req.end();
