const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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

pool.query(reateTableQuery)
	.then(() => console.log('Database table ready'))
	.catch(err => console.error('Database setup error:', err));

module.exports = pool;