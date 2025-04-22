import { db } from './db';
import { migrate } from 'drizzle-orm/pg-core/migrator';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    console.log('Starting database migrations...');
    
    // Add the Stripe columns to users table
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT
    `);
    
    // Create subscriptions table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        tier subscription_tier DEFAULT 'free' NOT NULL,
        stripe_subscription_id TEXT,
        stripe_customer_id TEXT,
        status TEXT DEFAULT 'inactive' NOT NULL,
        current_period_start TIMESTAMP NOT NULL,
        current_period_end TIMESTAMP NOT NULL,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

runMigration();