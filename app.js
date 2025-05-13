const express = require('express');
const path = require('path'); // added
const app = express();
const port = 3000;

// (Optional) serve static files from ./public
app.use(express.static('public'));

// simple root route
app.get('/', (req, res) => {
  // changed to send the correct file path
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/roulette', (req, res) => {
  // changed to send the correct file path
  res.sendFile(path.join(__dirname, 'public','game.html'));
});

app.get('/blackjack', (req, res) => {
  // changed to send the correct file path
  res.sendFile(path.join(__dirname, 'bj','bj.html'));
});
app.use('/coins', express.static(path.join(__dirname, 'coins')));

// start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});