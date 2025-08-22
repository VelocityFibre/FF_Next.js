// Test Firebase services
// Run with: node test-firebase-services.js

const https = require('https');

const API_KEY = 'AIzaSyDvW-ImXptnYIX7IDR78pdruw9BAp5A8Q8';
const PROJECT_ID = 'fibreflow-292c7';

console.log('Testing Firebase APIs for project:', PROJECT_ID);
console.log('Using API Key:', API_KEY);
console.log('-----------------------------------\n');

// Test 1: Identity Toolkit API (Authentication)
function testAuthAPI() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      returnSecureToken: true
    });

    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signUp?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        const result = JSON.parse(responseData);
        if (res.statusCode === 200 || res.statusCode === 400) {
          if (result.error && result.error.message.includes('API key not valid')) {
            console.log('❌ Auth API: API key is not valid or API not enabled');
            console.log('   Error:', result.error.message);
          } else if (result.error && result.error.message.includes('ADMIN_ONLY_OPERATION')) {
            console.log('✅ Auth API: Working (admin operation attempted)');
          } else {
            console.log('✅ Auth API: Working');
          }
        } else {
          console.log('❌ Auth API: Failed');
          console.log('   Status:', res.statusCode);
          console.log('   Response:', responseData);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Auth API: Network error');
      console.log('   Error:', error.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Test 2: Firebase Installations API
function testInstallationsAPI() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      appId: '1:178707510767:web:a9455c8f053de03fbff21a',
      authVersion: 'FIS_v2',
      sdkVersion: 'w:0.6.4'
    });

    const options = {
      hostname: 'firebaseinstallations.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/installations`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Installations API: Working');
        } else {
          const result = JSON.parse(responseData);
          if (result.error && result.error.message.includes('API key not valid')) {
            console.log('❌ Installations API: API key is not valid or API not enabled');
            console.log('   Error:', result.error.message);
          } else {
            console.log('❌ Installations API: Failed');
            console.log('   Status:', res.statusCode);
            console.log('   Response:', responseData);
          }
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Installations API: Network error');
      console.log('   Error:', error.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Test 3: Firestore API
function testFirestoreAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/test?key=${API_KEY}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log('✅ Firestore API: Working');
        } else if (res.statusCode === 403) {
          const result = JSON.parse(responseData);
          if (result.error && result.error.message.includes('API key not valid')) {
            console.log('❌ Firestore API: API key is not valid or API not enabled');
            console.log('   Error:', result.error.message);
          } else {
            console.log('⚠️  Firestore API: Permission denied (API working but needs auth)');
          }
        } else {
          console.log('❌ Firestore API: Failed');
          console.log('   Status:', res.statusCode);
          console.log('   Response:', responseData);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Firestore API: Network error');
      console.log('   Error:', error.message);
      resolve();
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  await testAuthAPI();
  console.log();
  await testInstallationsAPI();
  console.log();
  await testFirestoreAPI();
  
  console.log('\n-----------------------------------');
  console.log('TROUBLESHOOTING STEPS:\n');
  console.log('If APIs show as "not valid", you need to:');
  console.log('1. Go to https://console.cloud.google.com/apis/dashboard?project=' + PROJECT_ID);
  console.log('2. Enable these APIs:');
  console.log('   - Identity Toolkit API');
  console.log('   - Firebase Installations API');
  console.log('   - Cloud Firestore API');
  console.log('   - Cloud Storage API');
  console.log('\nOr run these commands:');
  console.log('gcloud config set project ' + PROJECT_ID);
  console.log('gcloud services enable identitytoolkit.googleapis.com');
  console.log('gcloud services enable firebaseinstallations.googleapis.com');
  console.log('gcloud services enable firestore.googleapis.com');
  console.log('gcloud services enable storage.googleapis.com');
}

runTests();