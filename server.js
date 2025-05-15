const express = require('express');
const cors = require('cors');
const db = require('./db_config');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get all seat statuses
app.get('/api/seats', (req, res) => {
  db.query("SELECT * FROM flight_seats ORDER BY seat_number", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Update seat status
app.post('/api/seats/update', (req, res) => {
  const { seat_number, status } = req.body;

  db.query("UPDATE flight_seats SET status = ? WHERE seat_number = ?", [status, seat_number], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.sendStatus(200);
  });
});

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});