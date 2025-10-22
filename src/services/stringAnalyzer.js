const crypto = require('crypto');

class StringAnalyzer {
	static analyzeString(inputString) {
		if (typeof inputString !== 'string') {
			throw new Error('Input must be a string');
		}

		// Remove extra whitespace
		const normalizedString = inputString.trim().replace(/\s+/g, ' ');

		// Properties
		const length = normalizedString.length;
		const isPalindrome = this.isPalindrome(normalizedString);
		const uniqueCharacters = this.countUniqueCharacters(normalizedString);
		const wordCount = this.countWords(normalizedString);
		const characterFrequencyMap = this.getCharacterFrequency(normalizedString);
		const sha256_hash = this.generateSHA256(normalizedString);

		return {
			id: sha256_hash,
			value: normalizedString,
			properties: {
				length,
				is_palindrome: isPalindrome,
				unique_characters: uniqueCharacters,
				word_count: wordCount,
				sha256_hash,
				character_frequency_map: characterFrequencyMap
			},
			created_at: new Date().toISOString()
		};
	}

	static isPalindrome(str) {
		const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
		return cleanStr === cleanStr.split('').reverse().join('');
	}

	static countWords(str) {
		return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
	}

	static getCharacterFrequency(str) {
		const frequency = {};
		const cleanstr = str.toLowerCase();

		for (let char of cleanstr) {
			frequency[char] = (frequency[char] || 0) + 1;
		}

		return frequency;
	}
	static generateSHA256(str) {
		return crypto.createHash('sha256').update(str).digest('hex');
	}
}

module.exports = StringAnalyzer;