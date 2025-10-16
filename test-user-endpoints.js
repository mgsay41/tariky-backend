const API_URL = 'http://localhost:4000/api';

// Test data
const testClerkId = 'user_test_' + Date.now();
const testUserData = {
  clerkId: testClerkId,
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  profilePhoto: 'https://example.com/photo.jpg'
};

const testOnboardingData = {
  phoneNumber: '+251912345678',
  college: 'Computer Science',
  semester: 'Year 3, Semester 1',
  university: 'Addis Ababa University'
};

async function runTests() {
  console.log('🧪 Starting User API Tests...\n');

  try {
    // Test 1: Create User
    console.log('✅ Test 1: POST /api/users/create-or-update (Create New User)');
    const createResponse = await fetch(`${API_URL}/users/create-or-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUserData)
    });
    const createResult = await createResponse.json();
    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createResult, null, 2));
    console.log('Is New User:', createResult.data?.isNewUser);
    console.log('');

    // Test 2: Update User (call again with same clerkId)
    console.log('✅ Test 2: POST /api/users/create-or-update (Update Existing User)');
    const updateResponse = await fetch(`${API_URL}/users/create-or-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testUserData, firstName: 'Updated' })
    });
    const updateResult = await updateResponse.json();
    console.log('Status:', updateResponse.status);
    console.log('Response:', JSON.stringify(updateResult, null, 2));
    console.log('Is New User:', updateResult.data?.isNewUser);
    console.log('');

    // Test 3: Check Profile (should be incomplete)
    console.log('✅ Test 3: GET /api/users/check-profile/:clerkId (Before Onboarding)');
    const checkResponse1 = await fetch(`${API_URL}/users/check-profile/${testClerkId}`);
    const checkResult1 = await checkResponse1.json();
    console.log('Status:', checkResponse1.status);
    console.log('Response:', JSON.stringify(checkResult1, null, 2));
    console.log('Is Complete:', checkResult1.data?.isComplete);
    console.log('');

    // Test 4: Get Profile
    console.log('✅ Test 4: GET /api/users/profile/:clerkId');
    const profileResponse = await fetch(`${API_URL}/users/profile/${testClerkId}`);
    const profileResult = await profileResponse.json();
    console.log('Status:', profileResponse.status);
    console.log('Response:', JSON.stringify(profileResult, null, 2));
    console.log('');

    // Test 5: Complete Onboarding
    console.log('✅ Test 5: PUT /api/users/complete-onboarding/:clerkId');
    const onboardingResponse = await fetch(`${API_URL}/users/complete-onboarding/${testClerkId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOnboardingData)
    });
    const onboardingResult = await onboardingResponse.json();
    console.log('Status:', onboardingResponse.status);
    console.log('Response:', JSON.stringify(onboardingResult, null, 2));
    console.log('Is Complete:', onboardingResult.data?.user?.isProfileComplete);
    console.log('');

    // Test 6: Check Profile (should be complete now)
    console.log('✅ Test 6: GET /api/users/check-profile/:clerkId (After Onboarding)');
    const checkResponse2 = await fetch(`${API_URL}/users/check-profile/${testClerkId}`);
    const checkResult2 = await checkResponse2.json();
    console.log('Status:', checkResponse2.status);
    console.log('Response:', JSON.stringify(checkResult2, null, 2));
    console.log('Is Complete:', checkResult2.data?.isComplete);
    console.log('');

    // Test 7: Test enrollment endpoint validation
    console.log('✅ Test 7: POST /api/courses/1/enroll (Test with clerkId)');
    const enrollResponse = await fetch(`${API_URL}/courses/1/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId: testClerkId })
    });
    const enrollResult = await enrollResponse.json();
    console.log('Status:', enrollResponse.status);
    console.log('Response:', JSON.stringify(enrollResult, null, 2));
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
runTests();
