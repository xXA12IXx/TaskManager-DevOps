const Database = require('better-sqlite3');

// En pruebas usa una BD en memoria; en uso normal, el archivo tasks.db
const db = new Database(process.env.NODE_ENV === 'test' ? ':memory:' : 'tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    estado TEXT NOT NULL DEFAULT 'pendiente',
    prioridad TEXT NOT NULL DEFAULT 'media'
  )
`);

module.exports = db;