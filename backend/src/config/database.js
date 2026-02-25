const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const DB_PATH = path.join(dataDir, 'ecommerce.db');

let _db = null;
let _SQL = null;
let _initPromise = null;

async function getDb() {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    _SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      _db = new _SQL.Database(buffer);
    } else {
      _db = new _SQL.Database();
    }
    _db.run('PRAGMA foreign_keys = ON');
    _db.run('PRAGMA journal_mode = WAL');
    return _db;
  })();

  _db = await _initPromise;
  _initPromise = null;
  return _db;
}

function saveDb() {
  if (_db) {
    const data = _db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

function convertSql(sql) {
  // Replace $1, $2, ... with ? for sql.js
  return sql.replace(/\$\d+/g, '?');
}

/**
 * Execute rows from a prepared statement with bound params.
 * Works for SELECT and INSERT/UPDATE/DELETE ... RETURNING *
 */
function stmtAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute SQL with optional parameters.
 * Returns { rows, rowCount, lastID } to mimic node-postgres (pg) behaviour.
 */
async function query(text, params = []) {
  const db = await getDb();
  const sql = convertSql(text);
  const upper = text.trim().toUpperCase();
  const isRead = /^(SELECT|WITH|PRAGMA|EXPLAIN)/.test(upper);
  const hasReturning = /RETURNING/i.test(text);

  try {
    if (isRead || hasReturning) {
      const rows = stmtAll(db, sql, params);
      if (!isRead) saveDb();
      return { rows, rowCount: rows.length };
    }

    db.run(sql, params);
    saveDb();
    const lastIDResult = db.exec('SELECT last_insert_rowid()');
    const lastID = lastIDResult[0]?.values[0][0] ?? null;
    const rowCount = db.getRowsModified();
    return { rows: [], rowCount, lastID };
  } catch (err) {
    console.error('DB Query Error:', err.message, '\nSQL:', sql, '\nParams:', params);
    throw err;
  }
}

/**
 * Transaction client — simulates pg transaction client.
 */
async function getClient() {
  const db = await getDb();
  let txActive = false;

  const execQuery = async (text, params = []) => {
    const sql = convertSql(text);
    const upper = text.trim().toUpperCase();
    const isRead = /^(SELECT|WITH|PRAGMA)/.test(upper);
    const hasReturning = /RETURNING/i.test(text);

    if (upper === 'BEGIN') {
      db.run('BEGIN');
      txActive = true;
      return { rows: [], rowCount: 0 };
    }
    if (upper === 'COMMIT') {
      if (txActive) { db.run('COMMIT'); saveDb(); }
      txActive = false;
      return { rows: [], rowCount: 0 };
    }
    if (upper === 'ROLLBACK') {
      if (txActive) db.run('ROLLBACK');
      txActive = false;
      return { rows: [], rowCount: 0 };
    }

    try {
      if (isRead || hasReturning) {
        const rows = stmtAll(db, sql, params);
        return { rows, rowCount: rows.length };
      }

      db.run(sql, params);
      const lastIDResult = db.exec('SELECT last_insert_rowid()');
      const lastID = lastIDResult[0]?.values[0][0] ?? null;
      const rowCount = db.getRowsModified();
      return { rows: [], rowCount, lastID };
    } catch (err) {
      console.error('TX Query Error:', err.message, '\nSQL:', sql);
      throw err;
    }
  };

  return { query: execQuery, release: () => {} };
}

module.exports = { query, getClient, getDb, saveDb };
