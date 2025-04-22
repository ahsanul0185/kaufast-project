// Simple script to run the seed function
import { seed } from './server/seed.js';

async function runSeed() {
  try {
    console.log('Starting database seed...');
    await seed();
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
}

runSeed();