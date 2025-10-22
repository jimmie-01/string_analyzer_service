class NaturalLanguageParser {
	static parseQuery(query) {
		const lowerQuery = query.toLowerCase();
		const filters = {};

		// Parse word count
		if (lowerQuery.includes('single word') || lowerQuery.includes('one word')) {
			filters.word_count = 1;
		} else if (lowerQuery.includes('two words') || lowerQuery.includes('2 words')) {
			filters.word_count = 2;
		} else if (lowerQuery.includes('three words') || lowerQuery.includes('3 words')) {
			filters.word_count = 3;
		}

		// Parse palindrome
		if (lowerQuery.includes('palindrome')) {
			filters.is_palindrome = true;
		}

		// Parse length filters
		const longerMatch = lowerQuery.match(/(?:longer than|greater than|more than)\s+(\d+)\s+characters?/);
		const shorterMatch = lowerQuery.match(/(?:shorter than|less than|fewer than)\s+(\d+)\s+characters?/);

		if (longerMatch) {
			filters.min_length = parseInt(longerMatch[1]) + 1;
		}
		if(shorterMatch) {
			filters.max_length = parseInt(shorterMatch[1]) - 1;
		}

		// Parse character contains
		const charMatch = lowerQuery.match(/(?:contain(?:s|ing)?|with|having)\s+(?:the\s+)?(?:letter\s+)?([a-z])/);
		if (charMatch) {
			filters.contains_character = charMatch[1];
		}

		// Parse specific vowels
		const vowels = ['a', 'e', 'i', 'o', 'u'];
		for (let vowel of vowels) {
			if (lowerQuery.includes(`first vowel`) && vowel === 'a') {
				filters.contains_character = 'a';
				break;
			}
			if (lowerQuery.includes(`vowel ${vowel}`) || lowerQuery.includes(`${vowel} vowel`)) {
				filters.contains_character = vowel;
				break;
			}
		}
		return filters;
	}
	
	static validateFilters(filters) {
		// Check for conflicting filters
		if (filters.min_length !== undefined && filters.max_length !== undefined) {
			if(filters.min_length > filters.max_length) {
				throw new Error('Conflicting filters: min_length cannot be greater than max_length');
			}
		}

		if (filters.contains_character && filters.contains_character.length !== 1) {
			throw new Error('Invalid character filter: must be a single character');
		}

		return filters;
	}
}

module.exports = NaturalLanguageParser;