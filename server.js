const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Serve all files in project root as static
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for any unmatched route (useful for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Generative Art app running at http://localhost:${PORT}`);
}); 