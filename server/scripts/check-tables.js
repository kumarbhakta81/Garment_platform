const pool = require('../config/db');

async function showTables() {
  try {
    console.log('Current database tables:');
    const [tables] = await pool.query('SHOW TABLES');
    console.log(tables);
    
    console.log('\nProducts table structure:');
    const [productStructure] = await pool.query('DESCRIBE products');
    console.log(productStructure);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

showTables().catch(console.error);