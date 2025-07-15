const http = require('http');

// Test configuration
const HOST = 'localhost';
const PORT = 3000;

// Test data
const testRequest = {
  location: "Goa",
  skills: ["Fashion Shoots", "Weddings"],
  budget: 75000,
  style_preferences: ["documentary", "candid"]
};

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log(' Running BreadButter API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await makeRequest('/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Message: ${health.data.message}`);
    console.log(`   Profiles: ${health.data.profilesLoaded}\n`);

    // Test 2: API Info
    console.log('2. Testing API Info...');
    const apiInfo = await makeRequest('/api');
    console.log(`   Status: ${apiInfo.status}`);
    console.log(`   API: ${apiInfo.data.api}`);
    console.log(`   Total Talents: ${apiInfo.data.totalTalents}\n`);

    // Test 3: Match Request
    console.log('3. Testing Match Request...');
    const match = await makeRequest('/api/match', 'POST', testRequest);
    console.log(`   Status: ${match.status}`);
    console.log(`   Success: ${match.data.success}`);
    if (match.data.matches) {
      console.log(`   Matches Found: ${match.data.matches.length}`);
      match.data.matches.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.name} (Score: ${m.score}) - ${m.reason}`);
      });
    }
    console.log(`   Processing Time: ${match.data.metadata?.processing_time_ms}ms\n`);

    // Test 4: Talent Stats
    console.log('4. Testing Talent Stats...');
    const stats = await makeRequest('/api/talents/stats');
    console.log(`   Status: ${stats.status}`);
    console.log(`   Total Talents: ${stats.data.statistics?.total_talents}`);
    console.log(`   Cities: ${stats.data.statistics?.cities?.length}\n`);

    // Test 5: Get Talents
    console.log('5. Testing Get Talents...');
    const talents = await makeRequest('/api/talents?limit=5');
    console.log(`   Status: ${talents.status}`);
    console.log(`   Talents Returned: ${talents.data.data?.length}`);
    console.log(`   Total Available: ${talents.data.pagination?.total}\n`);

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run tests if server is running
setTimeout(() => {
  makeRequest('/health')
    .then(() => runTests())
    .catch(() => {
      console.log('Server not running. Please start the server first:');
      console.log(' npm start');
    });
}, 1000);