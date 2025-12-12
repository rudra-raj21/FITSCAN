// Test script to validate your Raindrop API integration
// Run this in your browser console when your app is running

// Test API validation
async function testRaindropApi() {
  const apiKey = 'lm_apikey_087cb4c3fba1468690bb06df8a362c664eab1a94e0964ef1';
  const orgId = 'apikey_087cb4c3fba1468690bb06df8a362c664eab1a94e0964ef1';
  
  console.log('Testing Raindrop API integration...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('Org ID:', orgId);
  
  try {
    // Test API validation
    const response = await fetch('https://api.liquidmetal.ai/v1/auth/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Org-ID': orgId
      },
      body: JSON.stringify({
        action: 'validate_access'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API validation successful:', result);
      return true;
    } else {
      const error = await response.json();
      console.log('❌ API validation failed:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error);
    return false;
  }
}

// Test the bridge configuration
async function testBridgeConfiguration() {
  console.log('Testing bridge configuration...');
  
  // Check if environment variables are loaded
  const envVars = {
    VITE_RAINDROP_API_KEY: import.meta.env.VITE_RAINDROP_API_KEY,
    VITE_RAINDROP_ORG_ID: import.meta.env.VITE_RAINDROP_ORG_ID,
    VITE_RAINDROP_API_URL: import.meta.env.VITE_RAINDROP_API_URL
  };
  
  console.log('Environment variables:', envVars);
  
  // Test if the bridge can be configured
  const bridge = window.raindropBridge; // Assuming bridge is available globally
  
  if (bridge) {
    try {
      const result = await bridge.configureApi(
        envVars.VITE_RAINDROP_API_KEY,
        envVars.VITE_RAINDROP_ORG_ID
      );
      console.log('✅ Bridge configuration result:', result);
      return result;
    } catch (error) {
      console.log('❌ Bridge configuration failed:', error);
      return false;
    }
  } else {
    console.log('❌ Bridge not available');
    return false;
  }
}

// Run tests
console.log('=== Raindrop API Integration Test ===');
testRaindropApi().then(result => {
  console.log('API Test Result:', result ? 'SUCCESS' : 'FAILED');
});
testBridgeConfiguration().then(result => {
  console.log('Bridge Test Result:', result ? 'SUCCESS' : 'FAILED');
});