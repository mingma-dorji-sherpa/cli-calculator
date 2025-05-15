const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'user',
  database: 'flight_db'
});

module.exports = db;