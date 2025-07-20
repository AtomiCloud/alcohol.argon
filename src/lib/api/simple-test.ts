/**
 * Simple runnable test to demonstrate the adapter working
 *
 * To test in Next.js development mode:
 * 1. Run: pls dev
 * 2. Add this to a page: import { runSimpleTest } from '@/lib/api/simple-test'
 * 3. Call runSimpleTest() in a button click or useEffect
 */

import { AlcoholZincApi } from '@/clients/alcohol/zinc/api';
import { createSafeApiClient } from './swagger-adapter';
import { ProblemTransformer } from '@/lib/problem/core/transformer';
import { NoOpErrorReporter, ProblemRegistry } from '@/lib/problem';
import { PROBLEM_DEFINITIONS } from '@/problems/registry';

const API_BASE_URL = 'http://localhost:9003';

// Create a problem registry and transformer for testing
const mockConfig = {
  baseUri: 'http://localhost:3000',
  version: 'v1',
  service: 'argon-webapp',
};
const problemRegistry = new ProblemRegistry(mockConfig, PROBLEM_DEFINITIONS);
const errorReporter = new NoOpErrorReporter();
const problemTransformer = new ProblemTransformer(problemRegistry, errorReporter);

export async function runSimpleTest() {
  console.log('🚀 Running Swagger Adapter Test...\n');

  // Create API client with problem transformer
  const zincApi = new AlcoholZincApi({ baseUrl: API_BASE_URL });
  const safeZincApi = createSafeApiClient(zincApi, {
    problemTransformer,
    instance: 'zinc-api-test',
  });

  // Test 1: Successful endpoint
  console.log('=== Test 1: Success Case ===');
  try {
    const result = await safeZincApi.getRoot();
    console.log(await result.serial());
  } catch (e) {
    console.log('❌ EXCEPTION:', e);
  }

  console.log('\n---\n');

  // Test 2: Error that returns Problem Details
  console.log('=== Test 2: Problem Details Error ===');
  try {
    const result = await safeZincApi.api.vErrorInfoDetail('invalid-id', '1.0');
    console.log(await result.serial());
  } catch (e) {
    console.log('❌ EXCEPTION:', e);
  }

  console.log('\n---\n');

  // Test 3: Error that gets transformed to Problem Details
  console.log('=== Test 3: Non-Problem Error (Transformed) ===');
  try {
    const result = await safeZincApi.api.vUserList({ version: '1.0', Username: 'nonexistent' });
    console.log(await result.serial());
  } catch (e) {
    console.log('❌ EXCEPTION:', e);
  }

  console.log('\n✅ Test completed! Check console for detailed results.');

  // Test 4: Error that gets transformed to Problem Details
  console.log('=== Test 4: Non-Problem Error (Transformed) ===');
  try {
    const result = await safeZincApi.api.vErrorInfoRandomErrorList('1.0');
    console.log(await result.serial());
  } catch (e) {
    console.log('❌ EXCEPTION:', e);
  }

  console.log('\n---\n');

  // Test 5: Network/Fetch Error (Non-HTTP Error)
  console.log('=== Test 5: Network Error (Custom Fetch Error) ===');
  try {
    // Create a faulty API client with custom fetch that throws errors
    const faultyZincApi = new AlcoholZincApi({
      baseUrl: API_BASE_URL,
      customFetch: (() => {
        throw new RangeError('Network connection out of range - simulated network failure');
      }) as unknown as typeof fetch,
    });

    const safeFaultyApi = createSafeApiClient(faultyZincApi, {
      problemTransformer,
      instance: 'faulty-api-test',
    });

    const result = await safeFaultyApi.getRoot();
    console.log(await result.serial());
  } catch (e) {
    console.log('❌ EXCEPTION:', e);
  }

  console.log('\n✅ Test completed! Check console for detailed results.');
}

// Export for use in development/browser console
export default runSimpleTest;
