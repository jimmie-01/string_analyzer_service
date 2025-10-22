const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()')
	.then(() => console.log('Connected to PostgreSQL on Railway'))
	.catch(err => {
		comnsole.error('Database connection failed:', err);
		process.exit(1);
	});

module.exports = pool;