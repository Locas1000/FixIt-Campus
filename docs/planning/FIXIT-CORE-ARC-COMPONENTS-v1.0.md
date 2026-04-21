
# FIXIT-CORE-ARC-COMPONENTS-v1.0
# Component & Architecture Diagram — FixIt Campus (SGM)

**Project:** FixIt Campus (SGM)  
**Version:** 1.0  
**Date:** 2026-04-16  

---

## General System View (System Context)

```mermaid
graph TD
    subgraph Client["📱 Frontend (React / Vite)"]
        UI_LOGIN["Login & Auth\n(JWT LocalStorage)"]
        UI_DISPATCH["Dispatcher Dashboard\n(Desktop 3-Pane View)"]
        UI_TECH["Technician App\n(Mobile Single-Pane)"]
        UI_UPLOAD["ImageUploadComponent\n(Cloudinary integration)"]
    end

    subgraph External["☁️ External Services"]
        CLOUDINARY["Cloudinary CDN\n(Image Hosting)"]
    end

    subgraph Backend["⚙️ Backend API (Express.js)"]
        subgraph Controllers["Business Logic"]
            APP_AUTH["auth.controller\n(Login, Register)"]
            APP_TICKETS["tickets.controller\n(CRUD, Status, History)"]
        end

        subgraph Middleware["Transversal Services"]
            JWT_BOUNCER["auth.middleware\n(JWT Verification & Bouncer)"]
        end
    end

    subgraph DB["🗄️ Database (PostgreSQL)"]
        TABLE_USERS["Users\n(id, role, password_hash)"]
        TABLE_TICKETS["Tickets\n(id, status, priority)"]
        TABLE_HISTORY["TicketHistory\n(Audit logs)"]
        TABLE_IMAGES["TicketImages\n(Cloudinary URLs)"]
    end

    %% Client -> External (The Direct Upload Pattern)
    UI_UPLOAD -->|1. Direct POST Unsigned| CLOUDINARY
    CLOUDINARY -->|2. Returns secure_url| UI_UPLOAD

    %% Client -> Backend
    UI_LOGIN -->|POST /login| APP_AUTH
    UI_DISPATCH -->|HTTP Requests| JWT_BOUNCER
    UI_TECH -->|HTTP Requests| JWT_BOUNCER

    %% Backend Internal Routing
    JWT_BOUNCER -->|If valid token| APP_TICKETS

    %% Backend -> DB
    APP_AUTH -->|SELECT and INSERT| TABLE_USERS
    APP_TICKETS -->|SELECT and UPDATE| TABLE_TICKETS
    APP_TICKETS -->|INSERT| TABLE_HISTORY
    APP_TICKETS -->|INSERT| TABLE_IMAGES
```

---

## Module Descriptions

| Module / Component | Primary Responsibility | Dependencies |
|---|---|---|
| **React UI App** | Rendering the responsive Master-Detail layout and capturing user inputs. | `REST API`, `Cloudinary` |
| **auth.controller** | Verifying credentials, hashing passwords, generating JWTs. | `Users` Table, `bcrypt`, `jsonwebtoken` |
| **tickets.controller** | Core CRUD operations, mapping API contracts, ensuring audit logs are created on updates. | `Tickets`, `TicketHistory`, `TicketImages` Tables |
| **auth.middleware** | The "Bouncer". Intercepts requests to verify JWT signatures before allowing access. | `jsonwebtoken` |
| **PostgreSQL DB** | The single source of truth for all structured relational data. | — |
| **Cloudinary** | Processing and hosting heavy image files to keep the Express server unblocked. | — |

---

## Core Flow: Creating a Ticket with Evidence

Because our architecture uses a **Frontend-Direct-to-Cloudinary** pattern to reduce server load, the flow of creating a ticket with an image requires specific orchestration between the client, the external CDN, and our database.

```mermaid
sequenceDiagram
    actor Tech as Technician React
    participant Cloud as Cloudinary API
    participant API as Express API
    participant Mid as auth.middleware
    participant DB as PostgreSQL

    Tech->>Cloud: POST /image/upload Raw Image File
    Note over Tech,Cloud: Uses Unsigned Upload Preset
    Cloud-->>Tech: 200 OK Returns secure_url

    Tech->>Mid: POST /api/tickets JSON Ticket Details + Image URL
    Note over Tech,Mid: Header Authorization Bearer Token
    
    Mid->>Mid: Verify JWT Signature
    Mid->>API: next Passes req.user

    API->>DB: BEGIN Transaction
    API->>DB: INSERT INTO Tickets status Open
    DB-->>API: Returns new ticket_id

    API->>DB: INSERT INTO TicketImages ticket_id, image_url
    
    API->>DB: COMMIT Transaction
    API-->>Tech: 201 Created Formatted Ticket Object
```
