const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'biuser',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bidb',
  password: process.env.PGPASSWORD || 'bipassword',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate(); 