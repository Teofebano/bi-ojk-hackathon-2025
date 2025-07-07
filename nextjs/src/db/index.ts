import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER || 'biuser',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'bidb',
  password: process.env.PGPASSWORD || 'bipassword',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

export default pool; 