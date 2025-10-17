#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupSupabase() {
  console.log('🚀 Supabase Setup for Delivery System');
  console.log('=====================================\n');

  console.log('📋 You need to create a Supabase project first:');
  console.log('1. Go to https://supabase.com');
  console.log('2. Sign up/Login and create a new project');
  console.log('3. Wait for the project to be set up (1-2 minutes)');
  console.log('4. Go to Settings → API to get your credentials\n');

  const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://your-project-id.supabase.co): ');
  const supabaseAnonKey = await question('Enter your Supabase Anon Key (starts with eyJ...): ');
  const supabaseServiceKey = await question('Enter your Supabase Service Role Key (starts with eyJ...): ');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.log('❌ All credentials are required. Please try again.');
    rl.close();
    return;
  }

  // Create .env file content
  const envContent = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (if using email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# PayPal Configuration (if using PayPal)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# M-Pesa Configuration (if using M-Pesa)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=sandbox

# AI Features Configuration
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Google AI (Gemini) Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash

# Anthropic Claude Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307

# AI Features Toggle
ENABLE_AI_FEATURES=true
ENABLE_SMART_ROUTING=true
ENABLE_DEMAND_PREDICTION=true
ENABLE_CUSTOMER_SUPPORT_AI=true
ENABLE_DYNAMIC_PRICING=true
ENABLE_FRAUD_DETECTION=true
ENABLE_SENTIMENT_ANALYSIS=true

# AI Service Selection (openai, google, anthropic, or hybrid)
AI_SERVICE_PROVIDER=openai

# AI Feature Settings
AI_RESPONSE_CACHE_TTL=3600
AI_MAX_CONCURRENT_REQUESTS=10
AI_RATE_LIMIT_PER_MINUTE=60

# Smart Routing AI Settings
ROUTING_OPTIMIZATION_ENABLED=true
ROUTING_ALGORITHM=genetic
ROUTING_UPDATE_INTERVAL=300

# Demand Prediction Settings
DEMAND_PREDICTION_HORIZON=24
DEMAND_PREDICTION_ACCURACY_THRESHOLD=0.8
DEMAND_PREDICTION_RETRAIN_INTERVAL=86400

# Dynamic Pricing Settings
PRICING_ALGORITHM=demand_based
PRICING_UPDATE_FREQUENCY=900
PRICING_SURGE_THRESHOLD=1.5
PRICING_MIN_MULTIPLIER=1.0
PRICING_MAX_MULTIPLIER=3.0

# Fraud Detection Settings
FRAUD_DETECTION_SENSITIVITY=medium
FRAUD_DETECTION_MODEL_VERSION=v1.0
FRAUD_DETECTION_REAL_TIME=true

# Customer Support AI Settings
SUPPORT_AI_LANGUAGE=en
SUPPORT_AI_RESPONSE_STYLE=professional
SUPPORT_AI_ESCALATION_THRESHOLD=0.3

# Sentiment Analysis Settings
SENTIMENT_ANALYSIS_ENABLED=true
SENTIMENT_ANALYSIS_SOURCES=reviews,feedback,support
SENTIMENT_ALERT_THRESHOLD=-0.5
`;

  try {
    // Write .env file
    fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
    console.log('✅ .env file created successfully!');

    console.log('\n📋 Next Steps:');
    console.log('1. Set up your database schema:');
    console.log('   - Go to your Supabase dashboard → SQL Editor');
    console.log('   - Copy and run the contents of supabase-schema.sql');
    console.log('   - This will create all necessary tables and indexes');
    
    console.log('\n2. Migrate your existing data:');
    console.log('   npm run migrate:supabase');
    
    console.log('\n3. Test your setup:');
    console.log('   npm run dev');
    console.log('   # Visit http://localhost:8080 to test your app');
    
    console.log('\n4. Test Supabase connection:');
    console.log('   curl http://localhost:8080/api/ping');
    
    console.log('\n🎉 Supabase setup completed!');
    console.log('Your delivery system is now ready to use Supabase as the database.');

  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }

  rl.close();
}

setupSupabase().catch(console.error);
