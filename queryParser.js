function parseNaturalQuery(query) {
  if (!query || typeof query !== "string") {
    throw { status: 400, message: "Invalid query" };
  }

  const lowerQuery = query.toLowerCase();
  const filters = {};

  // Detect palindromes
  if (lowerQuery.includes("palindromic") || lowerQuery.includes("palindrome")) {
    filters.is_palindrome = true;
  }

  // Detect word count like "single word" or "two words"
  if (lowerQuery.includes("single word")) filters.word_count = 1;
  else if (lowerQuery.includes("two words")) filters.word_count = 2;
  else if (lowerQuery.includes("three words")) filters.word_count = 3;

  // Detect length conditions like "longer than 10" or "shorter than 5"
  const longerMatch = lowerQuery.match(/longer than (\d+)/);
  const shorterMatch = lowerQuery.match(/shorter than (\d+)/);
  const betweenMatch = lowerQuery.match(/between (\d+) and (\d+)/);

  if (longerMatch) filters.min_length = parseInt(longerMatch[1]) + 1;
  if (shorterMatch) filters.max_length = parseInt(shorterMatch[1]) - 1;
  if (betweenMatch) {
    filters.min_length = parseInt(betweenMatch[1]);
    filters.max_length = parseInt(betweenMatch[2]);
  }

  // Detect character inclusion: "containing the letter a" or "containing z"
  const containMatch = lowerQuery.match(/containing (?:the letter )?([a-z])/);
  if (containMatch) filters.contains_character = containMatch[1];

  // Basic sanity check
  if (Object.keys(filters).length === 0) {
    throw { status: 400, message: "Unable to parse natural language query" };
  }

  return filters;
}

module.exports = { parseNaturalQuery };