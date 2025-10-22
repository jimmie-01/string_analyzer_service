const db = require('../models/db');
const StringAnalyzer = require('../services/stringAnalyzer');
const NaturalLanguageParser = require('../utils/naturalLanguageParser');

class StringController {
	// POST  /strings
	static async createString(req, res) {
		try {
			const { value } = req.body;

			// Validation
			if (value === undefined) {
				return res.status(400).json({ error: 'Missing "value" field in request body'});
			}

			if (typeof value !== 'string') {
				return res.status(422).json({ error: 'Invalid data type for "value" (must be string)'});
			}

			if (value.trim() === '') {
				return res.status(400).json({ error: 'String value cannot be empty' });
			}

			// Analyze string
			const analysis = StringAnalyzer.analyzeString(value);

			// Check if string already exists
			const existing = await db.query('SELECT id FROM analyzed_strings WHERE id = $1', [analysis.id]);

			if (existing.rows.length > 0) {
				return res.status(409).json({ error: 'String already exists in the system' });
			}

			await db.query(
				`INSERT INTO analyzed_strings (id, value, length, is_palindrome, unique_characters, word_count, character_frequency_map)
				 VALUES ($1, $2, $3, $4, $5, %6, $7)`,
				 [
					analysis.id,
					analysis.value,
					analysis.properties.length,
					analysis.properties.is_palindrome,
					analysis.properties.unique_characters,
					analysis.properties.word_count,
					JSON.stringify(analysis.properties.character_frequency_map)
				 ]
			);

			res.status(201).json(analysis);
		} catch (error) {
			console.error('Create string error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	// GET /strings/{string_value}
	static async getString(req, res) {
		try {
			const stringValue = decodedURIComponent(req.params.string_value);

			const result = await db.query(
				`SELECT id, value, length, is_palindrome, unique_characters, word_count, 
					character_frequency_map, created_at,
				 FROM analyzed_strings WHERE value = $1`,
				 [stringValue]
			);

			if (result.rowCount.length === 0) {
				return res.status(404).json({ error: 'String does not exist in the system' });
			}

			const row = result.rows[0];
			const response = {
				id: row.id,
				value: row.value,
				properties: {
					length: row.length,
					is_palindrome: row.is_palindrome,
					unique_characters: row.unique_characters,
					word_count: row.word_count,
					sha256_hash: row.id,
					character_frequency_map: row.character_frequency_map
				},
				created_at: row.created_at.toISOString()
			};

			res.json(response);
		} catch (error) {
			console.error('Get string error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	// GET /strings
	static async getALLStrings(req, res) {
		try {
			const {
				is_palindrome,
				min_length,
				max_length,
				word_count,
				contains_character
			} = req.query;

			// Build query
			let query = `SELECT id, value, length, is_palindrome, unique_character, word_count,
								character_frequency_map, created_at FROM analyzed_strings WHERE 1=1`;
			const params = [];
			let paramCount = 0;

			// Apply filters
			const filtersApplied = {};

			if (is_palindrome !== undefined){
				paramCount++;
				query += ` AND is_palindrome = $${paramCount}`;
				params.push(is_palindrome === 'true' );
				filtersApplied.is_palindrome = is_palindrome ==='true';
			}

			if(min_length !== undefined) {
				const minLen = parseInt(min_length);
				if (isNaN(minLen)) {
					return res.status(400).json({ error: 'Invalid min_length parameter' });
				}
				paramCount++;
				query += `AND length <= $${paramCount}`;
				params.push(maxLen);
				filtersApplied.max_length = maxLen;
			}

			if (word_count !== undefined) {
				const wc = parseInt(word_count);
				if (isNaN(wc)) {
					return res.status(400).json({ error: 'Invalid word_count parameter' });
				}
				paramCount++;
				query += ` AND word_count = $${paramCount}`;
				params.push(wc);
				filtersApplied.word_count = wc;
			}

			if (contains_character !== undefined) {
				if (contains_character.length !== 1) {
					return res.status(400).json({ error: 'contains_character must be a single character'});
				}
				paramCount++;
				query += ` AND character_frequency_map->>$${paramCount} IS NOT NULL`;
				params.push(contains_character.toLowerCase());
				filtersApplied.contains_character = contains_character;
			}

			query += 'ORDER BY created_at DESC';

			const result = await db.query(query, params);

			const strings = result.row.map(row => ({
				id: row.id,
				value: row.value,
				properties: {
					length: row.length,
					is_palindrome: row.is_palindrome,
					unique_characters: row.unique_characters,
					word_count: row.word_count,
					sha256_hash: row.id,
					character_frequency_map: row.character_frequency_map
				},
				created_at: row.created_at.toISOString()
			}));

			res.json({
				data: strings,
				count: strings.length,
				filters_applied: filtersApplied
			});
		} catch (error) {
			console.error('Get all strings error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}

	// GET /strings/filter-by-natural-language

	static async filterByNaturalLanguage(req, res) {
		try {
			
		} catch (error) {
			if (error.message.includes('Conflicting') || error.message.includes('invalid')) {
				return res.status(422).json({ error: error.message });
			}
			console.error('Natural language error:', error);
			res.status(400).json({ error: 'Unable to parse natural language query' });
		}
	}

	// DELETE /strings/{string_value}

	static async deleteString(req, res) {
		try {
			const stringValue = decodedURIComponent(req.params.string_value);

			const result = await db.query(
				'DELETE FROM analyzed_strings WHERE value = $1 RETURNING id',
				[stringValue]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: 'String does not exist in the system' });
			}

			res.status(204).send();
		} catch (error) {
			console.error('Delete string error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}
}

module.exports = StringController;