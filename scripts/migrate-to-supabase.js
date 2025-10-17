import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/data/users.json'), 'utf8'));
    
    for (const user of usersData) {
      const userData = {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        password: user.password,
        user_type: user.userType,
        is_active: user.isActive,
        created_at: user.createdAt
      };
      
      const { error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error migrating user ${user.id}:`, error);
      } else {
        console.log(`✅ Migrated user: ${user.fullName}`);
      }
    }
  } catch (error) {
    console.error('❌ Error reading users.json:', error);
  }
}

async function migrateActivities() {
  console.log('🔄 Migrating activities...');
  
  try {
    const activitiesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/data/activities.json'), 'utf8'));
    
    for (const activity of activitiesData) {
      const activityData = {
        id: activity.id,
        rider_id: activity.riderId === 'SYSTEM' ? null : activity.riderId,
        rider_name: activity.riderName,
        type: activity.type,
        description: activity.description,
        amount: activity.amount,
        metadata: activity.metadata,
        timestamp: activity.timestamp
      };
      
      const { error } = await supabase
        .from('activities')
        .upsert(activityData, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error migrating activity ${activity.id}:`, error);
      } else {
        console.log(`✅ Migrated activity: ${activity.description}`);
      }
    }
  } catch (error) {
    console.error('❌ Error reading activities.json:', error);
  }
}

async function migrateLocations() {
  console.log('🔄 Migrating locations...');
  
  try {
    const locationsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/data/locations.json'), 'utf8'));
    
    // Process locations in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < locationsData.length; i += batchSize) {
      const batch = locationsData.slice(i, i + batchSize);
      
      const locationData = batch.map(location => ({
        id: location.id,
        name: location.name,
        place_name: location.place_name,
        center: `(${location.center[0]},${location.center[1]})`, // Convert to PostGIS point format
        tags: location.tags,
        source: location.source
      }));
      
      const { error } = await supabase
        .from('locations')
        .upsert(locationData, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error migrating locations batch ${i}-${i + batchSize}:`, error);
      } else {
        console.log(`✅ Migrated locations batch ${i}-${i + batchSize}`);
      }
    }
  } catch (error) {
    console.error('❌ Error reading locations.json:', error);
  }
}

async function migrateResetTokens() {
  console.log('🔄 Migrating reset tokens...');
  
  try {
    const tokensData = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/data/resetTokens.json'), 'utf8'));
    
    for (const [token, tokenData] of Object.entries(tokensData)) {
      const resetTokenData = {
        token: token,
        email: tokenData.email,
        expires: tokenData.expires,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('reset_tokens')
        .upsert(resetTokenData, { onConflict: 'token' });
      
      if (error) {
        console.error(`❌ Error migrating reset token ${token}:`, error);
      } else {
        console.log(`✅ Migrated reset token for: ${tokenData.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error reading resetTokens.json:', error);
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...');
  console.log('📊 This will migrate your existing JSON data to Supabase');
  
  try {
    await migrateUsers();
    await migrateActivities();
    await migrateLocations();
    await migrateResetTokens();
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your data has been migrated to Supabase');
    console.log('📝 Next steps:');
    console.log('   1. Update your environment variables with Supabase credentials');
    console.log('   2. Update your route handlers to use the DatabaseService');
    console.log('   3. Test your application with the new database');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
