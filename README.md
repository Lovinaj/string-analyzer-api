# String Analyzer API

A RESTful API service that analyzes strings and provides powerful filtering capabilities, including natural language query processing.

## Features

- **String Analysis**: Automatically analyzes strings for length, palindrome detection, unique characters, word count, and SHA-256 hash
- **Flexible Filtering**: Query strings using standard parameters or natural language
- **In-Memory Storage**: Fast, simple storage for development and testing
- **Character Frequency Analysis**: Detailed breakdown of character occurrences

## Installation

```bash
npm install express crypto
```

## Project Structure

```
.
├── app.js              # Main Express application and routes
├── analyzer.js         # String analysis logic
├── queryParser.js      # Natural language query parser
└── README.md          # This file
```

## Getting Started

1. Start the server:
```bash
node app.js
```

2. The server will run on `http://localhost:3000` (or the PORT environment variable)

## API Endpoints

### Create a String

**POST** `/strings`

Add a new string for analysis.

**Request Body:**
```json
{
  "value": "hello world"
}
```

**Response (201):**
```json
{
  "id": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-21T12:00:00.000Z"
}
```

### Get All Strings (with filters)

**GET** `/strings`

Retrieve all strings with optional query parameters.

**Query Parameters:**
- `is_palindrome` (boolean): Filter by palindrome status
- `min_length` (number): Minimum string length
- `max_length` (number): Maximum string length
- `word_count` (number): Exact word count
- `contains_character` (string): Must contain this character

**Example:**
```
GET /strings?is_palindrome=true&min_length=5
```

**Response (200):**
```json
{
  "data": [...],
  "count": 3,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5
  }
}
```

### Filter by Natural Language

**GET** `/strings/filter-by-natural-language`

Query strings using natural language.

**Query Parameters:**
- `query` (string): Natural language query

**Supported Queries:**
- `"all palindromic strings"`
- `"single word strings"`
- `"two words"`
- `"three words"`
- `"longer than 10"`
- `"shorter than 5"`
- `"between 5 and 10"`
- `"containing the letter a"`
- Combinations: `"all single word palindromic strings longer than 3"`

**Example:**
```
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Response (200):**
```json
{
  "data": [...],
  "count": 2,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "is_palindrome": true,
      "word_count": 1
    }
  }
}
```

### Get a Specific String

**GET** `/strings/:value`

Retrieve a specific string by its value (case-insensitive).

**Example:**
```
GET /strings/hello
```

**Response (200):**
```json
{
  "id": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  "value": "hello",
  "properties": {...},
  "created_at": "2025-10-21T12:00:00.000Z"
}
```

### Delete a String

**DELETE** `/strings/:value`

Remove a string from storage.

**Example:**
```
DELETE /strings/hello
```

**Response (204):** No content

## Error Responses

- **400 Bad Request**: Missing or invalid parameters
- **404 Not Found**: String not found
- **409 Conflict**: String already exists
- **422 Unprocessable Entity**: Value must be a string

## Analysis Properties

Each string is analyzed and assigned the following properties:

- **id**: SHA-256 hash of the string
- **value**: The original string
- **length**: Total character count
- **is_palindrome**: Whether the string reads the same forwards and backwards (ignoring spaces and case)
- **unique_characters**: Count of distinct characters
- **word_count**: Number of words (split by whitespace)
- **sha256_hash**: Cryptographic hash of the string
- **character_frequency_map**: Object showing how many times each character appears
- **created_at**: ISO timestamp of when the string was added

## Examples

### Add some strings:
```bash
curl -X POST http://localhost:3000/strings -H "Content-Type: application/json" -d '{"value":"racecar"}'
curl -X POST http://localhost:3000/strings -H "Content-Type: application/json" -d '{"value":"hello"}'
curl -X POST http://localhost:3000/strings -H "Content-Type: application/json" -d '{"value":"A man a plan a canal Panama"}'
```

### Find palindromes:
```bash
curl "http://localhost:3000/strings?is_palindrome=true"
```

### Use natural language:
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20palindromic%20strings"
```

## Notes

- Strings are stored in memory and will be lost when the server restarts
- String matching is case-insensitive for retrieval and deletion
- Palindrome detection ignores spaces and is case-insensitive
- Each string must be unique (duplicates return 409 error)

## License

MIT

## Author

Lovina Jonathan