require("dotenv").config({ path: ".env.dev" }); // Pastikan untuk memuat variabel dari file .env

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected as id " + connection.threadId);
});

module.exports = connection;
