const express = require ("express")
const { analyzeString } = require("./analyzer")

const app = express()

// Middleware to parse JSON request bodies
app.use(express.json());

// Array storage
const strings = [];

// Post a string
app.post('/strings', (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'Missing value' });
  if (typeof value !== 'string') return res.status(422).json({ error: 'Value must be a string' });
  if (strings.find((s) => s.value === value)) return res.status(409).json({ error: 'Already exists' });

  const data = analyzeString(value);
  strings.push(data);
  res.status(201).json(data);
});

// Get ALL strings
app.get('/strings', (req, res) => {
  // Example query params: ?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

  let results = strings; 

  // --- Filtering logic ---
  if (is_palindrome !== undefined) {
    const boolVal = is_palindrome === 'true';
    results = results.filter(s => s.properties.is_palindrome === boolVal);
  }

  if (min_length) results = results.filter(s => s.properties.length >= Number(min_length));
  if (max_length) results = results.filter(s => s.properties.length <= Number(max_length));
  if (word_count) results = results.filter(s => s.properties.word_count === Number(word_count));
  if (contains_character) results = results.filter(s => s.value.includes(contains_character));

  // --- Response structure ---
  res.status(200).json({
    data: results,
    count: results.length,
    filters_applied: {
      ...(is_palindrome && { is_palindrome: is_palindrome === 'true' }),
      ...(min_length && { min_length: Number(min_length) }),
      ...(max_length && { max_length: Number(max_length) }),
      ...(word_count && { word_count: Number(word_count) }),
      ...(contains_character && { contains_character })
    }
  });
});

// Geting a particular string
app.get('/strings/:value', (req, res) => {
  const param = req.params.value.trim().toLowerCase();
  const stringData = strings.find((s) => s.value.toLowerCase() === param);
  if (!stringData) return res.status(404).json({ error: 'Not found' });
  res.status(200).json({
    id: stringData.id,
    value: stringData.value,
    properties: stringData.properties,
    created_at: stringData.created_at
  });
});

// Natural Language Filtering Endpoint
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  const lowerQuery = query.toLowerCase();
  const parsed_filters = {};
  let results = [...strings];

  try {
    // --- Simple Natural Language Parsing Heuristics ---

    // Palindrome detection
    if (lowerQuery.includes("palindrome")) {
      parsed_filters.is_palindrome = true;
      results = results.filter((s) => s.properties.is_palindrome === true);
    }

    // Single / multiple word strings
    if (lowerQuery.includes("single word")) {
      parsed_filters.word_count = 1;
      results = results.filter((s) => s.properties.word_count === 1);
    } else if (lowerQuery.includes("two word")) {
      parsed_filters.word_count = 2;
      results = results.filter((s) => s.properties.word_count === 2);
    } else if (lowerQuery.includes("three word")) {
      parsed_filters.word_count = 3;
      results = results.filter((s) => s.properties.word_count === 3);
    }

    // Length-based filters
    const longerMatch = lowerQuery.match(/longer than (\d+)/);
    if (longerMatch) {
      const min = parseInt(longerMatch[1]);
      parsed_filters.min_length = min + 1;
      results = results.filter((s) => s.properties.length > min);
    }

    const shorterMatch = lowerQuery.match(/shorter than (\d+)/);
    if (shorterMatch) {
      const max = parseInt(shorterMatch[1]);
      parsed_filters.max_length = max - 1;
      results = results.filter((s) => s.properties.length < max);
    }

    // Contains letter
    const letterMatch = lowerQuery.match(/letter (\w)/);
    if (letterMatch) {
      const char = letterMatch[1];
      parsed_filters.contains_character = char;
      results = results.filter((s) => s.value.includes(char));
    }

    // “contain” or “containing” + character
    const containsMatch = lowerQuery.match(/contain(?:ing)? the letter (\w)/);
    if (containsMatch) {
      const char = containsMatch[1];
      parsed_filters.contains_character = char;
      results = results.filter((s) => s.value.includes(char));
    }

    // “first vowel” heuristic
    if (lowerQuery.includes("first vowel")) {
      parsed_filters.contains_character = "a"; // heuristic
      results = results.filter((s) => s.value.includes("a"));
    }

    // If no filters recognized
    if (Object.keys(parsed_filters).length === 0) {
      return res.status(400).json({
        error: "Unable to parse natural language query",
      });
    }

    // Optional: Conflict check (e.g., contradictory filters)
    if (
      parsed_filters.min_length &&
      parsed_filters.max_length &&
      parsed_filters.min_length > parsed_filters.max_length
    ) {
      return res.status(422).json({
        error: "Query parsed but resulted in conflicting filters",
      });
    }

    // Return success response
    res.status(200).json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters,
      },
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message 
    });
  }
});


app.delete('/strings/:value', (req, res) => {
  const index = strings.findIndex((s) => s.value === req.params.value);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  strings.splice(index, 1);
  res.status(204).send();
});


const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(` Server is running on http://localhost:${PORT}`);
})
