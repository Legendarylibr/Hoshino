// Integration test file for Hoshino backend
// Run with: node test-integration.js

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Mock Firebase Functions environment
process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId: 'hoshino-996d0',
  storageBucket: 'hoshino-996d0.appspot.com',
  locationId: 'us-central1'
});

// Initialize Firebase Admin for testing
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

// Import the functions to test
const globalDataFunctions = require('./global-data');

// Test data
const testWalletAddress = '0x1234567890abcdef1234567890abcdef12345678';
const testAchievementData = {
  title: 'Test Achievement',
  description: 'This is a test achievement',
  icon: '🧪',
  category: 'testing',
  rarity: 'common'
};

const testMilestoneData = {
  title: 'Test Milestone',
  description: 'This is a test milestone',
  icon: '🎯',
  type: 'testing',
  value: 1
};

const testMemoryData = {
  title: 'Test Memory',
  description: 'This is a test memory',
  type: 'special',
  mood: 5,
  energy: 5,
  hunger: 5
};

const testProgressData = {
  totalScore: 1000,
  achievements: 1,
  moonlings: 1,
  starFragments: 100,
  currentStreak: 1
};

// Mock request and response objects
function createMockReqRes(method = 'GET', body = {}, query = {}) {
  const req = {
    method,
    body,
    query,
    headers: {}
  };
  
  const res = {
    status: (code) => ({
      json: (data) => {
        console.log(`Response (${code}):`, JSON.stringify(data, null, 2));
        return res;
      },
      send: () => {
        console.log(`Response (${code}): sent`);
        return res;
      }
    }),
    json: (data) => {
      console.log('Response:', JSON.stringify(data, null, 2));
      return res;
    },
    set: (header, value) => {
      console.log(`Set header: ${header} = ${value}`);
      return res;
    }
  };
  
  return { req, res };
}

// Test functions
async function testGetGlobalLeaderboard() {
  console.log('\n🧪 Testing getGlobalLeaderboard...');
  const { req, res } = createMockReqRes('GET');
  
  try {
    await globalDataFunctions.getGlobalLeaderboard(req, res);
    console.log('✅ getGlobalLeaderboard test completed');
  } catch (error) {
    console.error('❌ getGlobalLeaderboard test failed:', error);
  }
}

async function testGetUserAchievements() {
  console.log('\n🧪 Testing getUserAchievements...');
  const { req, res } = createMockReqRes('GET', {}, { walletAddress: testWalletAddress });
  
  try {
    await globalDataFunctions.getUserAchievements(req, res);
    console.log('✅ getUserAchievements test completed');
  } catch (error) {
    console.error('❌ getUserAchievements test failed:', error);
  }
}

async function testUpdateUserProgress() {
  console.log('\n🧪 Testing updateUserProgress...');
  const { req, res } = createMockReqRes('POST', {
    walletAddress: testWalletAddress,
    type: 'test_update',
    data: testProgressData
  });
  
  try {
    await globalDataFunctions.updateUserProgress(req, res);
    console.log('✅ updateUserProgress test completed');
  } catch (error) {
    console.error('❌ updateUserProgress test failed:', error);
  }
}

async function testUnlockAchievement() {
  console.log('\n🧪 Testing unlockAchievement...');
  const { req, res } = createMockReqRes('POST', {
    walletAddress: testWalletAddress,
    achievementId: 'test-achievement',
    achievementData: testAchievementData
  });
  
  try {
    await globalDataFunctions.unlockAchievement(req, res);
    console.log('✅ unlockAchievement test completed');
  } catch (error) {
    console.error('❌ unlockAchievement test failed:', error);
  }
}

async function testAddMilestone() {
  console.log('\n🧪 Testing addMilestone...');
  const { req, res } = createMockReqRes('POST', {
    walletAddress: testWalletAddress,
    milestoneId: 'test-milestone',
    milestoneData: testMilestoneData
  });
  
  try {
    await globalDataFunctions.addMilestone(req, res);
    console.log('✅ addMilestone test completed');
  } catch (error) {
    console.error('❌ addMilestone test failed:', error);
  }
}

async function testAddMemory() {
  console.log('\n🧪 Testing addMemory...');
  const { req, res } = createMockReqRes('POST', {
    walletAddress: testWalletAddress,
    memoryId: 'test-memory',
    memoryData: testMemoryData
  });
  
  try {
    await globalDataFunctions.addMemory(req, res);
    console.log('✅ addMemory test completed');
  } catch (error) {
    console.error('❌ addMemory test failed:', error);
  }
}

async function testCORSHandling() {
  console.log('\n🧪 Testing CORS handling...');
  const { req, res } = createMockReqRes('OPTIONS');
  
  try {
    await globalDataFunctions.getGlobalLeaderboard(req, res);
    console.log('✅ CORS handling test completed');
  } catch (error) {
    console.error('❌ CORS handling test failed:', error);
  }
}

async function testInputValidation() {
  console.log('\n🧪 Testing input validation...');
  
  // Test invalid wallet address
  const { req: req1, res: res1 } = createMockReqRes('POST', {
    walletAddress: 'invalid',
    type: 'test',
    data: {}
  });
  
  try {
    await globalDataFunctions.updateUserProgress(req1, res1);
    console.log('✅ Input validation test completed');
  } catch (error) {
    console.error('❌ Input validation test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Hoshino Backend Integration Tests...\n');
  
  try {
    await testGetGlobalLeaderboard();
    await testGetUserAchievements();
    await testUpdateUserProgress();
    await testUnlockAchievement();
    await testAddMilestone();
    await testAddMemory();
    await testCORSHandling();
    await testInputValidation();
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Export for use in other test files
module.exports = {
  testGetGlobalLeaderboard,
  testGetUserAchievements,
  testUpdateUserProgress,
  testUnlockAchievement,
  testAddMilestone,
  testAddMemory,
  testCORSHandling,
  testInputValidation,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
