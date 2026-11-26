// Frontend de TaskManager: consume la API REST de app.js (backend)
const API = '/api/tareas';

const ESTADOS = [
  { valor: 'pendiente', texto: 'Pendiente' },
  { valor: 'en proceso', texto: 'En proceso' },
  { valor: 'terminada', texto: 'Terminada' },
];
const PRIORIDADES = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' };

let tareas = [];
let filtroActual = 'todas';
let editandoId = null;
let temporizadorMensaje = null;

// Elementos del DOM
const form = document.getElementById('form-tarea');
const panelForm = document.querySelector('.panel-formulario');
const tituloForm = document.getElementById('titulo-formulario');
const inputNombre = document.getElementById('nombre');
const inputDescripcion = document.getElementById('descripcion');
const selectPrioridad = document.getElementById('prioridad');
const errorNombre = document.getElementById('error-nombre');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const lista = document.getElementById('lista-tareas');
const vacio = document.getElementById('vacio');
const mensaje = document.getElementById('mensaje');

// ---------- Comunicación con la API ----------
async function llamarApi(metodo, url, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error inesperado');
  }
  return datos;
}

// ---------- Mensajes ----------
function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
  mensaje.hidden = false;
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => { mensaje.hidden = true; }, 3000);
}

function mostrarErrorNombre(texto) {
  errorNombre.textContent = texto;
  errorNombre.hidden = !texto;
  inputNombre.classList.toggle('invalido', Boolean(texto));
}

// ---------- Carga y render ----------
async function cargarTareas() {
  try {
    tareas = await llamarApi('GET', API);
    renderizar();
  } catch (e) {
    mostrarMensaje('No se pudieron cargar las tareas', true);
  }
}

function actualizarContadores() {
  document.getElementById('cont-todas').textContent = tareas.length;
  document.getElementById('cont-pendiente').textContent = tareas.filter((t) => t.estado === 'pendiente').length;
  document.getElementById('cont-en-proceso').textContent = tareas.filter((t) => t.estado === 'en proceso').length;
  document.getElementById('cont-terminada').textContent = tareas.filter((t) => t.estado === 'terminada').length;
}

function crearTarjeta(tarea) {
  const li = document.createElement('li');
  li.className = `tarea prioridad-${tarea.prioridad}` + (tarea.estado === 'terminada' ? ' terminada' : '');
  li.dataset.id = tarea.id;

  // Información (se usa textContent para evitar inyección de HTML)
  const info = document.createElement('div');
  const nombre = document.createElement('h3');
  nombre.className = 'tarea-nombre';
  nombre.textContent = tarea.nombre;
  info.appendChild(nombre);

  if (tarea.descripcion) {
    const descripcion = document.createElement('p');
    descripcion.className = 'tarea-descripcion';
    descripcion.textContent = tarea.descripcion;
    info.appendChild(descripcion);
  }

  const meta = document.createElement('div');
  meta.className = `tarea-meta prioridad-${tarea.prioridad}`;
  meta.textContent = PRIORIDADES[tarea.prioridad] || tarea.prioridad;
  info.appendChild(meta);

  // Controles: estado, editar y eliminar
  const controles = document.createElement('div');
  controles.className = 'tarea-controles';

  const selectEstado = document.createElement('select');
  selectEstado.setAttribute('aria-label', `Estado de la tarea ${tarea.nombre}`);
  ESTADOS.forEach((e) => {
    const opcion = document.createElement('option');
    opcion.value = e.valor;
    opcion.textContent = e.texto;
    opcion.selected = e.valor === tarea.estado;
    selectEstado.appendChild(opcion);
  });
  selectEstado.addEventListener('change', () => cambiarEstado(tarea.id, selectEstado.value));

  const botones = document.createElement('div');
  botones.className = 'botones-tarea';

  const btnEditar = document.createElement('button');
  btnEditar.type = 'button';
  btnEditar.className = 'btn-mini';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', () => iniciarEdicion(tarea.id));

  const btnEliminar = document.createElement('button');
  btnEliminar.type = 'button';
  btnEliminar.className = 'btn-mini eliminar';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.addEventListener('click', () => eliminarTarea(tarea.id));

  botones.append(btnEditar, btnEliminar);
  controles.append(selectEstado, botones);
  li.append(info, controles);
  return li;
}

function renderizar() {
  actualizarContadores();
  const visibles = filtroActual === 'todas' ? tareas : tareas.filter((t) => t.estado === filtroActual);

  lista.replaceChildren(...visibles.map(crearTarjeta));

  if (visibles.length === 0) {
    vacio.textContent = tareas.length === 0
      ? 'Aún no hay tareas. Registra la primera con el formulario.'
      : 'No hay tareas con este estado.';
    vacio.hidden = false;
  } else {
    vacio.hidden = true;
  }
}

// ---------- Acciones ----------
function limpiarFormulario() {
  form.reset();
  selectPrioridad.value = 'media';
  mostrarErrorNombre('');
  editandoId = null;
  tituloForm.textContent = 'Nueva tarea';
  btnGuardar.textContent = 'Guardar tarea';
  btnCancelar.hidden = true;
  panelForm.classList.remove('editando');
}

function iniciarEdicion(id) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;
  editandoId = id;
  inputNombre.value = tarea.nombre;
  inputDescripcion.value = tarea.descripcion || '';
  selectPrioridad.value = tarea.prioridad;
  mostrarErrorNombre('');
  tituloForm.textContent = 'Editar tarea';
  btnGuardar.textContent = 'Guardar cambios';
  btnCancelar.hidden = false;
  panelForm.classList.add('editando');
  inputNombre.focus();
}

async function guardarTarea(evento) {
  evento.preventDefault();
  const datos = {
    nombre: inputNombre.value.trim(),
    descripcion: inputDescripcion.value.trim(),
    prioridad: selectPrioridad.value,
  };

  if (!datos.nombre) {
    mostrarErrorNombre('El nombre de la tarea es obligatorio');
    inputNombre.focus();
    return;
  }
  mostrarErrorNombre('');

  try {
    if (editandoId === null) {
      await llamarApi('POST', API, datos);
      mostrarMensaje('Tarea guardada correctamente');
    } else {
      await llamarApi('PUT', `${API}/${editandoId}`, datos);
      mostrarMensaje('Tarea actualizada correctamente');
    }
    limpiarFormulario();
    await cargarTareas();
  } catch (e) {
    mostrarMensaje(e.message, true);
  }
}

async function cambiarEstado(id, estado) {
  try {
    await llamarApi('PATCH', `${API}/${id}/estado`, { estado });
    mostrarMensaje('Estado actualizado');
  } catch (e) {
    mostrarMensaje(e.message, true);
  }
  await cargarTareas();
}

async function eliminarTarea(id) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea || !confirm(`¿Eliminar la tarea "${tarea.nombre}"?`)) return;
  try {
    await llamarApi('DELETE', `${API}/${id}`);
    if (editandoId === id) limpiarFormulario();
    mostrarMensaje('Tarea eliminada');
  } catch (e) {
    mostrarMensaje(e.message, true);
  }
  await cargarTareas();
}

// ---------- Eventos ----------
form.addEventListener('submit', guardarTarea);
btnCancelar.addEventListener('click', limpiarFormulario);
inputNombre.addEventListener('input', () => mostrarErrorNombre(''));

document.getElementById('filtros').addEventListener('click', (evento) => {
  const boton = evento.target.closest('.filtro');
  if (!boton) return;
  filtroActual = boton.dataset.filtro;
  document.querySelectorAll('.filtro').forEach((b) => {
    const activo = b === boton;
    b.classList.toggle('activo', activo);
    b.setAttribute('aria-pressed', String(activo));
  });
  renderizar();
});

cargarTareas();
