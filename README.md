#  FixIt Campus

**Centralizing campus maintenance, one report at a time.**

FixIt Campus solves the decentralization and lack of tracking in campus fault reports. By replacing informal communication with a centralized lifecycle manager, it ensures every incident—from a broken light to a leaky pipe—is documented, audited, and resolved.

-----

##  About the Project

Currently, maintenance requests are often lost in the shuffle of emails and verbal reports. **FixIt Campus** provides:

  * **Centralized Lifecycle:** Tracks defects from initial report (with photo evidence) to audited resolution.
  * **Smart Assignment:** Allows managers to assign tasks based on workload and technician specialty.
  * **SLA Enforcement:** An automatic escalation system ensures no report is forgotten.
  * **Mobile-First Design:** Optimized for technicians to capture evidence on-site.

> 

-----

##  Scope & System Limits

To maintain high technical quality and meet deadlines, the following features are **strictly out of scope**:

  *  **Physical Inventory:** No stock management or warehouse purchasing. (Users can "Block" tickets if parts are missing).
  *  **Preventive Maintenance:** Purely corrective; no calendar-based or IoT-triggered work orders.
  *  **Payroll:** No salary calculation or electronic payments to personnel.

-----

##  Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite) |
| **Backend** | Node.js (Express) |
| **Database** | PostgreSQL |
| **Infrastructure** | Docker & Docker Compose |

-----

##  Quickstart Guide

You don’t need to install Node.js or PostgreSQL locally. Everything is containerized for a consistent environment.

### Prerequisites

  * **Docker Engine** and **Docker Compose** installed.

### 1\. Setup the Environment

Clone the repository and move into the project directory:

```bash
git clone https://github.com/Locas1000/IDS-final-project.git
cd IDS-final-project
```

### 2\. Configuration (Environment Variables)

Create a `.env` file in the root of the `backend` and `frontend` directories. You can copy the provided `.env.example` files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3\. Run the Application

Lift the containers using Docker Compose:

```bash
docker compose up --build
```

*(Use `-d` to run in the background).*

### 4\. Access Services

  * **Frontend (React UI):** [http://localhost:5173](http://localhost:5173)
  * **Backend API:** [http://localhost:5000](http://localhost:5000)
  * **Database:** `localhost:5432`
      * *User:* `admin` | *Password:* `password123` | *DB:* `sgm_db`

-----

##  Database Initialization

When running for the first time, your database will be empty. Follow one of these methods to populate the tables and seed initial data:

### Method A: Terminal (Recommended)

Inject the schema and seed data directly into the running container:

```bash
# 1. Create the schema
docker exec -i sgm_postgres psql -U admin -d sgm_db < backend/database/schema.sql

# 2. Populate with seed data
docker exec -i sgm_postgres psql -U admin -d sgm_db < backend/database/seed.sql
```

### Method B: Visual (DBeaver/pgAdmin)

1.  Connect using the credentials listed above.
2.  Open a new SQL Editor.
3.  Copy/Paste the contents of `backend/database/schema.sql` and execute.
4.  Open another SQL Editor (or clear the previous one), copy/paste the contents of `backend/database/seed.sql` and execute.

-----

##  Shutting Down

To stop the services:

  * If running in the foreground: Press **Ctrl + C**.
  * If running in the background:
    ```bash
    docker compose down
    ```

-----

##  Contributing

We follow a strict **GitHub Flow** strategy. Please review `CONTRIBUTING.md` for:

  * Branching strategies
  * Conventional Commits
  * File naming conventions

*All code requires a Pull Request review before merging into `main`.*