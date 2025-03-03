// Simple script to test environment variables
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('Environment Variables Test:');
console.log('---------------------------');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('REPLICATE_API_KEY:', process.env.REPLICATE_API_KEY ? '✅ Set' : '❌ Not set');
console.log('DEFAULT_MODEL:', process.env.DEFAULT_MODEL || 'Not set');
console.log('---------------------------'); 