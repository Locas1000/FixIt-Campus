-- 0. Limpieza (Optional: Use this to ensure a fresh start)
DROP TABLE IF EXISTS HistorialTickets CASCADE;
DROP TABLE IF EXISTS ImagenesTickets CASCADE;
DROP TABLE IF EXISTS Tickets CASCADE;
DROP TABLE IF EXISTS Usuarios CASCADE;

DROP TYPE IF EXISTS usuario_rol CASCADE;
DROP TYPE IF EXISTS ticket_estado CASCADE;
DROP TYPE IF EXISTS ticket_prioridad CASCADE;

-- 1. Creacion de Tipos ENUM
CREATE TYPE usuario_rol AS ENUM ('Usuario', 'Dispatcher', 'Tecnico');

CREATE TYPE ticket_estado AS ENUM (
    'Abierto', 
    'Asignado', 
    'En Progreso', 
    'Resuelto', 
    'Confirmado', 
    'Cerrado', 
    'Bloqueado'
);

CREATE TYPE ticket_prioridad AS ENUM ('Baja', 'Media', 'Alta');

-- 2. Tabla de Usuarios
CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol usuario_rol NOT NULL,
    especialidad VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    url_imagen_perfil VARCHAR(255),  
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Principal de Tickets
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado ticket_estado DEFAULT 'Abierto',
    prioridad ticket_prioridad DEFAULT 'Media',
    fecha_limite_sla TIMESTAMP,
    id_usuario_creador INT NOT NULL,
    id_tecnico_asignado INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_creador FOREIGN KEY (id_usuario_creador) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_tecnico FOREIGN KEY (id_tecnico_asignado) REFERENCES Usuarios(id) ON DELETE SET NULL
);

-- 4. Tabla de Evidencia Fotografica
CREATE TABLE ImagenesTickets (
    id SERIAL PRIMARY KEY,
    id_ticket INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    comentario_evidencia VARCHAR(150),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_evidencia FOREIGN KEY (id_ticket) REFERENCES Tickets(id) ON DELETE CASCADE
);

-- 5. Tabla de Auditoria
CREATE TABLE HistorialTickets (
    id SERIAL PRIMARY KEY,
    id_ticket INT NOT NULL,
    estado_anterior ticket_estado,
    estado_nuevo ticket_estado,
    id_usuario_cambio INT NOT NULL,
    comentario_cambio TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_ticket FOREIGN KEY (id_ticket) REFERENCES Tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario_cambio) REFERENCES Usuarios(id)
);