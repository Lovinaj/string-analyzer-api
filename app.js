const express = require ("express")
const { analyzeString } = require("./analyzer")
const { parseNaturalQuery } = require("./queryParser")

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

app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  let parsedFilters;
  try {
    parsedFilters = parseNaturalQuery(query);
  } catch (err) {
    return res
      .status(err.status || 400)
      .json({ error: err.message || "Unable to parse natural language query" });
  }

  // Apply filters (reuse logic from /strings)
  let results = strings;

  if (parsedFilters.is_palindrome !== undefined)
    results = results.filter(s => s.properties.is_palindrome === parsedFilters.is_palindrome);

  if (parsedFilters.min_length)
    results = results.filter(s => s.properties.length >= parsedFilters.min_length);

  if (parsedFilters.max_length)
    results = results.filter(s => s.properties.length <= parsedFilters.max_length);

  if (parsedFilters.word_count)
    results = results.filter(s => s.properties.word_count === parsedFilters.word_count);

  if (parsedFilters.contains_character)
    results = results.filter(s =>
      s.value.toLowerCase().includes(parsedFilters.contains_character.toLowerCase())
    );

  res.status(200).json({
    data: results,
    count: results.length,
    interpreted_query: {
      original: query,
      parsed_filters: parsedFilters
    }
  });
});

//Get ALL strings with optional filters
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

// Geting a particular string by value
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
