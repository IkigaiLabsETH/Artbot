// Simple test script for ReplicateService
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Initialize dotenv
dotenv.config();

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const MODEL_VERSION = '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'; // SDXL version

async function testReplicateAPI() {
  console.log('Testing Replicate API directly...');
  
  try {
    // Create a prediction
    console.log('Creating prediction...');
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          prompt: 'An artistic collaboration between human and AI, digital art',
          width: 1440,
          height: 1440,
          num_outputs: 1
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }
    
    const prediction = await response.json();
    console.log('Prediction created:', prediction.id);
    
    // Poll for the prediction result
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      console.log(`Prediction status: ${result.status}. Waiting...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`
        }
      });
      
      if (!pollResponse.ok) {
        throw new Error(`Polling failed with status ${pollResponse.status}: ${await pollResponse.text()}`);
      }
      
      result = await pollResponse.json();
    }
    
    if (result.status === 'failed') {
      throw new Error(`Prediction failed: ${result.error}`);
    }
    
    console.log('Image generation successful!');
    console.log('Image URL:', result.output);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testReplicateAPI().catch(console.error); 