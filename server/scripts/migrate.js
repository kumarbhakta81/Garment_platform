const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();
  
  console.log('Starting migrations...');
  
  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      console.log(`Running migration: ${file}`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Split by semicolon to handle multiple statements
      const statements = sqlContent.split(';').filter(statement => statement.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
          } catch (error) {
            console.error(`Error in ${file}:`, error.message);
            // Continue with other statements
          }
        }
      }
      console.log(`✅ Completed migration: ${file}`);
    }
  }
  
  console.log('Migrations completed!');
  process.exit(0);
}

runMigrations().catch(console.error);