// db.js
const sql = require('mssql');
const config = require('./config.json').sql;

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config).then(pool => pool).catch(err => { poolPromise = null; throw err; });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
