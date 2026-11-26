const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ESTADOS = ['pendiente', 'en proceso', 'terminada'];
const PRIORIDADES = ['alta', 'media', 'baja'];

const buscar = (id) => db.prepare('SELECT * FROM tareas WHERE id = ?').get(id);

// RF02: consultar tareas
app.get('/api/tareas', (req, res) => {
  res.json(db.prepare('SELECT * FROM tareas ORDER BY id').all());
});

// RF01 y RF06: registrar tarea (con prioridad)
app.post('/api/tareas', (req, res) => {
  const { nombre, descripcion = '', prioridad = 'media' } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (typeof descripcion !== 'string') {
    return res.status(400).json({ error: 'La descripción debe ser texto' });
  }
  if (!PRIORIDADES.includes(prioridad)) {
    return res.status(400).json({ error: 'Prioridad no válida' });
  }
  const info = db
    .prepare('INSERT INTO tareas (nombre, descripcion, prioridad) VALUES (?, ?, ?)')
    .run(nombre.trim(), descripcion, prioridad);
  res.status(201).json(buscar(info.lastInsertRowid));
});

// RF03 y RF06: editar tarea
app.put('/api/tareas/:id', (req, res) => {
  const actual = buscar(req.params.id);
  if (!actual) return res.status(404).json({ error: 'Tarea no encontrada' });

  const nombre = req.body.nombre !== undefined ? req.body.nombre : actual.nombre;
  const descripcion = req.body.descripcion !== undefined ? req.body.descripcion : actual.descripcion;
  const prioridad = req.body.prioridad !== undefined ? req.body.prioridad : actual.prioridad;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (typeof descripcion !== 'string') {
    return res.status(400).json({ error: 'La descripción debe ser texto' });
  }
  if (!PRIORIDADES.includes(prioridad)) {
    return res.status(400).json({ error: 'Prioridad no válida' });
  }
  db.prepare('UPDATE tareas SET nombre = ?, descripcion = ?, prioridad = ? WHERE id = ?')
    .run(nombre.trim(), descripcion, prioridad, req.params.id);
  res.json(buscar(req.params.id));
});

// RF05: cambiar estado
app.patch('/api/tareas/:id/estado', (req, res) => {
  if (!buscar(req.params.id)) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (!ESTADOS.includes(req.body.estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }
  db.prepare('UPDATE tareas SET estado = ? WHERE id = ?').run(req.body.estado, req.params.id);
  res.json(buscar(req.params.id));
});

// RF04: eliminar tarea
app.delete('/api/tareas/:id', (req, res) => {
  if (!buscar(req.params.id)) return res.status(404).json({ error: 'Tarea no encontrada' });
  db.prepare('DELETE FROM tareas WHERE id = ?').run(req.params.id);
  res.json({ mensaje: 'Tarea eliminada' });
});

module.exports = app;