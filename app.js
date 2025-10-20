const express = require ("express")
const { analyzeString } = require("./analyzer")

const app = express()

// Middleware to parse JSON request bodies
app.use(express.json());

// Array storage
const strings = [];

app.get("/", (req, res)=>{
    res.send("hello")
})

app.post('/strings', (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'Missing value' });
  if (typeof value !== 'string') return res.status(422).json({ error: 'Value must be a string' });
  if (strings.find((s) => s.value === value)) return res.status(409).json({ error: 'Already exists' });

  const data = analyzeString(value);
  strings.push(data);
  res.status(201).json(data);
});

app.get('/strings', (req, res) => {
  let results = [...strings];

  const { isPalindrome, minLength, maxLength } = req.query;
  if (isPalindrome) {
    if (isPalindrome !== 'true' && isPalindrome !== 'false')
      return res.status(400).json({ error: 'Invalid isPalindrome value' });
    results = results.filter((s) => s.isPalindrome === (isPalindrome === 'true'));
  }

  if (minLength) results = results.filter((s) => s.length >= parseInt(minLength));
  if (maxLength) results = results.filter((s) => s.length <= parseInt(maxLength));

  res.json(results);
});

app.get('/strings/:value', (req, res) => {
  const param = req.params.value.trim().toLowerCase();
  const stringData = strings.find((s) => s.value.toLowerCase() === param);
  if (!stringData) return res.status(404).json({ error: 'Not found' });
  res.json(stringData);
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
