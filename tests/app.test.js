const request = require('supertest');
const app = require('../app');
const db = require('../db');

// Limpia la tabla antes de cada prueba
beforeEach(() => {
  db.prepare('DELETE FROM tareas').run();
});

// Registra una tarea y devuelve la respuesta
const crearTarea = (datos) => request(app).post('/api/tareas').send(datos);

// Prueba de ejemplo del documento
test('registro de tarea (ejemplo del documento)', () => {
  const tarea = { nombre: 'Realizar actividad DevOps', estado: 'Pendiente' };
  expect(tarea.nombre).toBe('Realizar actividad DevOps');
  expect(tarea.estado).toBe('Pendiente');
});

test('la página principal responde', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
});

// CP01
test('CP01: registrar una tarea', async () => {
  const res = await crearTarea({
    nombre: 'Elaborar documentación',
    descripcion: 'Documento del proyecto',
    prioridad: 'alta',
  });
  toBe(500);
  expect(res.body.nombre).toBe('Elaborar documentación');
  expect(res.body.estado).toBe('pendiente');
  expect(res.body.id).toBeDefined();
});

// CP02
test('CP02: registrar una tarea sin nombre muestra validación', async () => {
  const res = await crearTarea({ nombre: '', descripcion: 'Sin nombre' });
  expect(res.status).toBe(400);
  expect(res.body.error).toBeDefined();
});

// CP03
test('CP03: consultar tareas', async () => {
  await crearTarea({ nombre: 'Tarea 1' });
  await crearTarea({ nombre: 'Tarea 2' });
  const res = await request(app).get('/api/tareas');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(2);
});

// CP04
test('CP04: editar una tarea', async () => {
  const creada = await crearTarea({ nombre: 'Nombre original' });
  const res = await request(app)
    .put(`/api/tareas/${creada.body.id}`)
    .send({ nombre: 'Nombre editado', descripcion: 'Nueva descripción' });
  expect(res.status).toBe(200);
  expect(res.body.nombre).toBe('Nombre editado');
  expect(res.body.descripcion).toBe('Nueva descripción');
});

test('editar una tarea que no existe devuelve 404', async () => {
  const res = await request(app).put('/api/tareas/9999').send({ nombre: 'X' });
  expect(res.status).toBe(404);
});

// CP05
test('CP05: eliminar una tarea', async () => {
  const creada = await crearTarea({ nombre: 'Tarea a eliminar' });
  const res = await request(app).delete(`/api/tareas/${creada.body.id}`);
  expect(res.status).toBe(200);

  const lista = await request(app).get('/api/tareas');
  expect(lista.body).toHaveLength(0);
});

// CP06
test('CP06: cambiar el estado de una tarea', async () => {
  const creada = await crearTarea({ nombre: 'Tarea con estado' });
  const res = await request(app)
    .patch(`/api/tareas/${creada.body.id}/estado`)
    .send({ estado: 'en proceso' });
  expect(res.status).toBe(200);
  expect(res.body.estado).toBe('en proceso');
});

test('un estado no válido es rechazado', async () => {
  const creada = await crearTarea({ nombre: 'Tarea' });
  const res = await request(app)
    .patch(`/api/tareas/${creada.body.id}/estado`)
    .send({ estado: 'inventado' });
  expect(res.status).toBe(400);
});

// CP07
test('CP07: se guarda la prioridad elegida', async () => {
  const res = await crearTarea({ nombre: 'Tarea urgente', prioridad: 'alta' });
  expect(res.body.prioridad).toBe('alta');
});

test('una prioridad no válida es rechazada', async () => {
  const res = await crearTarea({ nombre: 'Tarea', prioridad: 'urgentisima' });
  expect(res.status).toBe(400);
});