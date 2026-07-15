import 'dotenv/config';
import { runMigrations } from './runner.js';

runMigrations()
  .then(r => {
    console.log('Applied:', r.ran);
    console.log('Skipped (already applied):', r.skipped);
    process.exit(0);
  })
  .catch(e => {
    console.error('Migration failed:', e.message);
    process.exit(1);
  });
