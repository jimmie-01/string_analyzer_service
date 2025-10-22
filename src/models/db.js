const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
	});
	try
	{
		// Create table if non exists
		const createTableQuery = `
		CREATE TABLE IF NOT EXISTS analyzed_strings(
		id VARCHAR(64) PRIMARY KEY,
		value TEXT NOT NULL UNIQUE,
		length INTEGER NOT NULL,
		is_palindrome BOOLEAN NOT NULL,
		unique_characters INTEGER NOT NULL,
		word_count INTEGER NOT NULL,
		character_frequency_map JSONB NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
		`;
		await pool.query(createTableQuery);
		console.log('Database migration comleted successfully')
	} catch (error) {
		console.log('Migration Failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run If called directly
if (require.main === module) {
	migrate();
}
module.exports = migrate;