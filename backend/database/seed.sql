-- Clean up existing data to avoid primary key conflicts on re-runs
TRUNCATE TABLE HistorialTickets, ImagenesTickets, Tickets, Usuarios RESTART IDENTITY CASCADE;

-- 1. Create 3 Users (Usuario, Dispatcher, Tecnico)
INSERT INTO Usuarios (nombre, rol, email, password_hash, especialidad) VALUES
('Juan Pérez', 'Usuario', 'juan.perez@uag.edu.mx', '12345', 'Mantenimiento General'),
('Ana Martínez', 'Dispatcher', 'ana.admin@sgm.com', '12345', NULL),
('Carlos Ruiz', 'Tecnico', 'carlos.tech@sgm.com', '12345', 'Electricidad Industrial');

-- 2. Create 5 Tickets with various statuses and priorities
INSERT INTO Tickets (titulo, descripcion, estado, prioridad, id_usuario_creador, id_tecnico_asignado) VALUES
('Falla en Climatización A-202', 'El aire acondicionado no enciende y hace un ruido metálico.', 'Abierto', 'Alta', 1, NULL),
('Gotera en Laboratorio 3', 'Filtración de agua detectada cerca del rack de servidores.', 'Asignado', 'Alta', 1, 3),
('Mantenimiento Preventivo Elevador', 'Revisión mensual de cables y sensores del elevador norte.', 'En Progreso', 'Media', 2, 3),
('Lámpara fundida Pasillo B', 'Cambiar luminaria LED en el segundo piso.', 'Resuelto', 'Baja', 1, 3),
('Puerta de Acceso Atascada', 'La cerradura electrónica no reconoce los tags.', 'Bloqueado', 'Alta', 2, NULL);

-- 3. Add some evidence and history for a more realistic scenario
INSERT INTO ImagenesTickets (id_ticket, url_imagen, comentario_evidencia) VALUES
(1, 'https://cdn.sgm.com/evidencia/ac_noise.jpg', 'Foto del ventilador bloqueado.');

INSERT INTO HistorialTickets (id_ticket, estado_anterior, estado_nuevo, id_usuario_cambio, comentario_cambio) VALUES
(2, 'Abierto', 'Asignado', 2, 'Asignado a Carlos por cercanía al área.');