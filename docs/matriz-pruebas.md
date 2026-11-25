# Matriz de casos de prueba - TaskManager

Fecha de ejecución: ____/____/2026

| ID | Prueba | Resultado esperado | Resultado obtenido | Estado (Pasó/Falló) | Responsable | Evidencia |
|---|---|---|---|---|---|---|
| CP01 | Registrar una tarea | La tarea se guarda correctamente y aparece en el listado. | | | | docs/evidencias/CP01.png |
| CP02 | Registrar una tarea sin nombre | El sistema muestra una validación y no guarda la tarea. | | | | docs/evidencias/CP02.png |
| CP03 | Consultar tareas | Se muestra el listado de todas las tareas registradas. | | | | docs/evidencias/CP03.png |
| CP04 | Editar una tarea | Se actualiza la información de la tarea. | | | | docs/evidencias/CP04.png |
| CP05 | Eliminar una tarea | La tarea desaparece del listado. | | | | docs/evidencias/CP05.png |
| CP06 | Cambiar estado | Se actualiza el estado (pendiente, en proceso, terminada). | | | | docs/evidencias/CP06.png |
| CP07 | Seleccionar prioridad | Se guarda la prioridad elegida (alta, media, baja). | | | | docs/evidencias/CP07.png |
| CP08 | Editar una tarea dejando el nombre vacío | El sistema muestra una validación y conserva el nombre anterior. | | | | docs/evidencias/CP08.png |
| CP09 | Eliminar una tarea que no existe | La API responde 404 "Tarea no encontrada" sin fallar. | | | | docs/evidencias/CP09.png |
| CP10 | Registrar una tarea con prioridad inválida | La API responde 400 "Prioridad no válida" y no guarda la tarea. | | | | docs/evidencias/CP10.png |
| CP11 | Registrar una tarea con el nombre solo con espacios | El sistema muestra una validación y no guarda la tarea. | | | | docs/evidencias/CP11.png |

## Pasos de ejecución

**CP01.** Abrir el sistema, escribir el nombre "Elaborar documentación", agregar una descripción, elegir prioridad Alta y pulsar Guardar tarea. Verificar que aparece en el listado con el mensaje de confirmación.

**CP02.** Dejar el nombre vacío y pulsar Guardar tarea. Verificar que se muestra el error junto al campo.

**CP03.** Registrar al menos dos tareas y verificar que ambas aparecen en el listado y que los contadores coinciden.

**CP04.** Pulsar Editar en una tarea, cambiar nombre y descripción, y pulsar Guardar cambios. Verificar que el listado muestra los datos nuevos.

**CP05.** Pulsar Eliminar en una tarea y aceptar la confirmación. Verificar que desaparece del listado.

**CP06.** Cambiar el selector de estado de una tarea a "En proceso" y luego a "Terminada". Verificar que el cambio se mantiene al recargar la página.

**CP07.** Registrar una tarea por cada prioridad (alta, media y baja). Verificar que cada una muestra la prioridad elegida.

**CP08.** Pulsar Editar, borrar el nombre y pulsar Guardar cambios. Verificar que aparece la validación y que la tarea no cambió.

**CP09.** Desde la terminal (la interfaz no permite este caso):

```bash
curl -i -X DELETE http://localhost:3000/api/tareas/9999
```

Esperado: estado 404 y `{"error":"Tarea no encontrada"}`.

**CP10.** Desde la terminal (el selector de la interfaz no permite valores inválidos):

```bash
curl -i -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Prueba","prioridad":"urgentisima"}'
```

Esperado: estado 400 y `{"error":"Prioridad no válida"}`.

**CP11.** Escribir solo espacios en el nombre y pulsar Guardar tarea. Verificar que se muestra la validación.

## Resumen

- Casos ejecutados: ____
- Casos que pasaron: ____
- Casos que fallaron: ____ (Issues: #__, #__)
