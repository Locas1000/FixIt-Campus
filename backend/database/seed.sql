-- Clean up existing data to avoid primary key conflicts on re-runs
TRUNCATE TABLE TicketHistory, TicketImages, Tickets, Users RESTART IDENTITY CASCADE;

-- 1. Create 3 Users (User, Dispatcher, Technician)
INSERT INTO Users (name, role, email, password_hash, specialty) VALUES
('Juan Perez', 'User', 'juan.perez@uag.edu.mx', '12345', 'General Maintenance'),
('Ana Martinez', 'Dispatcher', 'ana.admin@sgm.com', '12345', NULL),
('Carlos Ruiz', 'Technician', 'carlos.tech@sgm.com', '12345', 'Industrial Electricity');

-- 2. Create 5 Tickets with various statuses and priorities
INSERT INTO Tickets (title, description, status, priority, creator_id, assigned_technician_id) VALUES
('A/C Failure A-202', 'The air conditioning will not turn on and makes a metallic noise.', 'Open', 'High', 1, NULL),
('Leak in Lab 3', 'Water leak detected near the server rack.', 'Assigned', 'High', 1, 3),
('Elevator Preventive Maintenance', 'Monthly check of cables and sensors in the north elevator.', 'In Progress', 'Medium', 2, 3),
('Burnt-out lamp Hallway B', 'Replace LED luminaire on the second floor.', 'Resolved', 'Low', 1, 3),
('Stuck Access Door', 'The electronic lock does not recognize RFID tags.', 'Blocked', 'High', 2, NULL);

-- 3. Add some evidence and history for a more realistic scenario
INSERT INTO TicketImages (ticket_id, image_url, evidence_comment) VALUES
(1, 'https://cdn.sgm.com/evidencia/ac_noise.jpg', 'Photo of the blocked fan.');

INSERT INTO TicketHistory (ticket_id, previous_status, new_status, changed_by_user_id, change_comment) VALUES
(2, 'Open', 'Assigned', 2, 'Assigned to Carlos due to proximity to the area.');