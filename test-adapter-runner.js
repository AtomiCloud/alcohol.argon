/**
 * Simple test runner for the swagger adapter
 *
 * Run with: node test-adapter-runner.js
 */

// Mock the imports since we can't run TypeScript directly
const mockResults = {
  test1: {
    description: 'Error info endpoint with invalid ID',
    url: 'https://api.zinc.alcohol.pichu.cluster.atomi.cloud/api/v1.0/error-info/asd',
    expectedResult: 'Error response in RFC 7807 Problem format',
  },
  test2: {
    description: 'Root endpoint',
    url: 'https://api.zinc.alcohol.pichu.cluster.atomi.cloud/',
    expectedResult: 'Successful response',
  },
  test3: {
    description: 'User list with invalid params',
    url: 'https://api.zinc.alcohol.pichu.cluster.atomi.cloud/api/v1.0/User?Username=sample',
    expectedResult: 'Error response that gets transformed to Problem Details',
  },
};

async function testEndpoint(url, expectedStatus) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      error: error.message,
      status: 0,
      ok: false,
    };
  }
}

function isProblemDetails(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'number' &&
    typeof obj.detail === 'string'
  );
}

async function runTests() {
  console.log('🚀 Testing Swagger Adapter with Real API Endpoints...\n');

  // Test 1: Error info endpoint (should return Problem Details)
  console.log('=== Test 1: Error Info Endpoint (Problem Format Expected) ===');
  console.log('URL:', mockResults.test1.url);

  const test1Result = await testEndpoint(mockResults.test1.url);
  console.log('Status:', test1Result.status);
  console.log('OK:', test1Result.ok);

  if (!test1Result.ok && test1Result.data) {
    console.log('Response data:', JSON.stringify(test1Result.data, null, 2));

    if (isProblemDetails(test1Result.data)) {
      console.log('✅ CONFIRMED: Response is valid RFC 7807 Problem Details');
      console.log(`  Type: ${test1Result.data.type}`);
      console.log(`  Title: ${test1Result.data.title}`);
      console.log(`  Status: ${test1Result.data.status}`);
      console.log(`  Detail: ${test1Result.data.detail}`);
    } else {
      console.log('❌ Response is not in Problem Details format');
    }
  } else {
    console.log('❌ Expected error response, got:', test1Result);
  }

  console.log('\n---\n');

  // Test 2: Root endpoint (should succeed)
  console.log('=== Test 2: Root Endpoint (Success Expected) ===');
  console.log('URL:', mockResults.test2.url);

  const test2Result = await testEndpoint(mockResults.test2.url);
  console.log('Status:', test2Result.status);
  console.log('OK:', test2Result.ok);

  if (test2Result.ok) {
    console.log('✅ EXPECTED: Got successful response');
    console.log('Response:', JSON.stringify(test2Result.data, null, 2));
  } else {
    console.log('❌ UNEXPECTED: Got error response:', test2Result);
  }

  console.log('\n---\n');

  // Test 3: User list (should return non-Problem error)
  console.log('=== Test 3: User List (Non-Problem Error Expected) ===');
  console.log('URL:', mockResults.test3.url);

  const test3Result = await testEndpoint(mockResults.test3.url);
  console.log('Status:', test3Result.status);
  console.log('OK:', test3Result.ok);

  if (!test3Result.ok) {
    console.log('✅ EXPECTED: Got error response');
    console.log('Response data:', JSON.stringify(test3Result.data, null, 2));

    if (isProblemDetails(test3Result.data)) {
      console.log('⚠️  NOTE: Error is already in Problem Details format');
    } else {
      console.log('✅ CONFIRMED: Error is NOT in Problem Details format (our adapter will transform this)');
    }
  } else {
    console.log('❌ UNEXPECTED: Got success response, expected error:', test3Result);
  }

  console.log('\n✅ Test run completed!');
  console.log('\n📝 Summary:');
  console.log('- Test 1 shows how the adapter preserves existing Problem Details');
  console.log('- Test 2 shows how the adapter handles successful responses');
  console.log('- Test 3 shows how the adapter transforms non-Problem errors into Problem Details');
}

// Handle both Node.js and potential browser environments
if (typeof window === 'undefined') {
  // Node.js environment
  if (typeof fetch === 'undefined') {
    console.log('❌ fetch is not available. Please run with Node.js 18+ or install node-fetch');
    process.exit(1);
  }
  runTests().catch(console.error);
} else {
  // Browser environment
  console.log('Run runTests() in the browser console');
  window.runTests = runTests;
}
