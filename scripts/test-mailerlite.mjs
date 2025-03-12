#!/usr/bin/env node

// This script tests the MailerLite API direct connection
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.MAILERLITE_API_KEY;

if (!API_KEY) {
  console.error('MAILERLITE_API_KEY not found in environment variables');
  process.exit(1);
}

async function testMailerLiteV3() {
  console.log('Testing MailerLite API v3...');
  
  const endpoint = 'https://connect.mailerlite.com/api/subscribers';
  
  const body = {
    email: 'test-v3@example.com',
    fields: {
      name: 'Test User V3',
      source: 'api_test_script',
    },
    groups: [],
    status: 'active',
  };
  
  console.log('Request body:', JSON.stringify(body, null, 2));
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    
    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    try {
      const json = JSON.parse(responseText);
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response text:', responseText);
    }
  } catch (error) {
    console.error('Error testing MailerLite API v3:', error);
  }
}

async function testMailerLiteV2() {
  console.log('\nTesting MailerLite API v2...');
  
  const endpoint = 'https://api.mailerlite.com/api/v2/subscribers';
  
  const body = {
    email: 'test-v2@example.com',
    name: 'Test User V2',
    fields: {
      source: 'api_test_script',
    },
    resubscribe: true,
  };
  
  console.log('Request body:', JSON.stringify(body, null, 2));
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MailerLite-ApiKey': API_KEY,
      },
      body: JSON.stringify(body),
    });
    
    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    try {
      const json = JSON.parse(responseText);
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response text:', responseText);
    }
  } catch (error) {
    console.error('Error testing MailerLite API v2:', error);
  }
}

// Run both tests
async function runTests() {
  await testMailerLiteV3();
  await testMailerLiteV2();
}

runTests().catch(console.error);