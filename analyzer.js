const crypto = require('crypto');

/**
 * Analyzes a string and computes all required properties
 * @param {string} value - The string to analyze
 * @returns {object} Analysis results with all properties
 */
function analyzeString(value) {
  // 1. Calculate length
  const length = value.length;

  // 2. Check if palindrome (case-insensitive)
  // Remove spaces and convert to lowercase for comparison
  const cleanedValue = value.toLowerCase().replace(/\s/g, '');
  const reversedValue = cleanedValue.split('').reverse().join('');
  const is_palindrome = cleanedValue === reversedValue;

  // 3. Count unique characters
  const uniqueChars = new Set(value);
  const unique_characters = uniqueChars.size;

  // 4. Count words (split by whitespace)
  const word_count = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  // 5. Generate SHA-256 hash
  const sha256_hash = crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');

  // 6. Create character frequency map
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }
  // 7. Add id (use hash) and timestamp
  const id = sha256_hash;
  const created_at = new Date().toISOString();
  return {
    id,
    value,
    properties: {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
    },
    created_at
  };
}

module.exports = { analyzeString };