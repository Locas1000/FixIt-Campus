-- 0. Cleanup (Optional: Use this to ensure a fresh start)
DROP TABLE IF EXISTS TicketHistory CASCADE;
DROP TABLE IF EXISTS TicketImages CASCADE;
DROP TABLE IF EXISTS Tickets CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;

-- 1. ENUM Types Creation
CREATE TYPE user_role AS ENUM ('User', 'Dispatcher', 'Technician');

CREATE TYPE ticket_status AS ENUM (
    'Open',
    'Assigned',
    'In Progress',
    'Resolved',
    'Confirmed',
    'Closed',
    'Blocked'
);

CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High');

-- 2. Users Table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    specialty VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tickets Main Table
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status ticket_status DEFAULT 'Open',
    priority ticket_priority DEFAULT 'Medium',
    sla_deadline TIMESTAMP,
    creator_id INT NOT NULL,
    assigned_technician_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT fk_technician FOREIGN KEY (assigned_technician_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- 4. Photographic Evidence Table
CREATE TABLE TicketImages (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    evidence_comment VARCHAR(150),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_evidence FOREIGN KEY (ticket_id) REFERENCES Tickets(id) ON DELETE CASCADE
);

-- 5. Audit Log Table
CREATE TABLE TicketHistory (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL,
    previous_status ticket_status,
    new_status ticket_status,
    changed_by_user_id INT NOT NULL,
    change_comment TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_ticket FOREIGN KEY (ticket_id) REFERENCES Tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES Users(id)
);
