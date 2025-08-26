const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '001_enhanced_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // eslint-disable-next-line no-console
    console.log(`Running ${statements.length} migration statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.startsWith('--') || statement.length === 0) continue;
      
      try {
        await pool.query(statement);
        // eslint-disable-next-line no-console
        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (err) {
        // Ignore "column already exists" and similar errors for idempotency
        if (err.code === 'ER_DUP_FIELDNAME' || 
            err.code === 'ER_TABLE_EXISTS_ERROR' ||
            err.code === 'ER_DUP_KEYNAME') {
          // eslint-disable-next-line no-console
          console.log(`⚠ Statement ${i + 1} skipped (already exists): ${err.message}`);
        } else {
          // eslint-disable-next-line no-console
          console.error(`✗ Error in statement ${i + 1}:`, err.message);
          throw err;
        }
      }
    }
    
    // eslint-disable-next-line no-console
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('Database migration completed');
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Database migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigrations };