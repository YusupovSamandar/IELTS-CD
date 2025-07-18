/**
 * Test file to verify audio removal functionality
 * This is a simple test to ensure the audio removal action works correctly
 */
import { removeAudio } from '@/actions/test-exam/audio-removal';
import { db } from '@/lib/db';

// Mock assessment ID for testing
const TEST_ASSESSMENT_ID = 'test-assessment-id';

/**
 * Test the audio removal functionality
 */
async function testAudioRemoval() {
  try {
    console.log('Testing audio removal functionality...');

    // Test 1: Try to remove audio from non-existent assessment
    try {
      await removeAudio('non-existent-id');
      console.log(
        '❌ Test 1 FAILED: Should have thrown error for non-existent assessment'
      );
    } catch (error) {
      console.log(
        '✅ Test 1 PASSED: Correctly threw error for non-existent assessment'
      );
    }

    // Test 2: Try to remove audio without assessment ID
    try {
      await removeAudio('');
      console.log(
        '❌ Test 2 FAILED: Should have thrown error for empty assessment ID'
      );
    } catch (error) {
      console.log(
        '✅ Test 2 PASSED: Correctly threw error for empty assessment ID'
      );
    }

    console.log('Audio removal tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for potential use
export { testAudioRemoval };
