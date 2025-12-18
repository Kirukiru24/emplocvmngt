const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "employee_db",
  password: "kira",
  port: 5432,
});

module.exports = pool;
