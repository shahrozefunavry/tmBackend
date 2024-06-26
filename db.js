// const mysql = require('mysql2')

// require('dotenv').config()
// const connection = mysql.createPool({
//   connectionLimit: 10,
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB,
//   port: process.env.DB_PORT,
//   debug: false
// })
// // module.exports = connection

const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB,
  port: process.env.DB_PORT,
  debug: false
})
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  if (conn) conn.release();
  console.log('Connected to the database');
});
module.exports = connection
