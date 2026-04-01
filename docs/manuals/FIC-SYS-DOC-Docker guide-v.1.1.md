# FixIt Campus: Docker Architecture & Developer Guide

Welcome to the Docker guide for the SGM project. This page explains how our local development environment works and how to safely make changes to the infrastructure as we build out the system.

## 1. How Our Architecture Works

Instead of installing PostgreSQL, Node.js, and React build tools directly on our computers, we use Docker to run them inside isolated "containers." The `docker-compose.yml` file in the root of the repository acts as the orchestrator, telling these containers how to talk to each other.

Our architecture is split into three main services:

* **`frontend` (Carlo's Domain):** Runs the React (Vite) application. It is exposed to your local browser on port `5173`. It features hot-reloading, meaning any changes saved to `.jsx` files will instantly update the browser.
* **`backend` (Mathew's Domain):** Runs the Node.js/Express server. It is exposed on port `5000`. It uses Nodemon, so any changes to the API routes will automatically restart the server.
* **`db` (Mario's Domain):** Runs the PostgreSQL 15 database. It is exposed on port `5432`. Data is saved to a persistent volume, so you won't lose your database records when you shut down the container.

---

## 2. Day-to-Day Operations

Run these commands from the root `IDS-final-project` folder.

**Start the Environment:**

```bash
docker compose up

```

*(Pro-tip: Add `-d` to the end to run it in "detached" mode so it doesn't hijack your terminal).*

**Stop the Environment:**

```bash
docker compose down

```

**View Logs (If running in detached mode):**
If a service crashes, you can view its specific logs to debug.

```bash
docker compose logs -f backend   # Watch Node.js API logs
docker compose logs -f frontend  # Watch React build logs
docker compose logs -f db        # Watch PostgreSQL logs

```

---

## 3. How to Make Changes & Update the Setup

### Scenario A: Adding a new NPM Package (Frontend/Backend)

Because the containers have their own isolated `node_modules` folders, if you add a new dependency (like `axios` for React or `bcrypt` for Node.js), you have to tell Docker to rebuild the container so it can install the new package.

**The Workflow:**

1. Stop the containers: `docker compose down`
2. Open your local terminal, navigate to the `frontend` or `backend` folder, and run your install command (e.g., `npm install axios`). This updates the `package.json` file.
3. Step back to the root folder and rebuild the containers using the `--build` flag:
```bash
docker compose up --build

```



### Scenario B: Changing Database Ports or Credentials

If port `5432` is already being used by another application on your computer, or if Mario needs to update the database credentials for testing, you can modify the `docker-compose.yml` file.

1. Open `docker-compose.yml`.
2. Locate the `db` service block.
3. To change the port, modify the left side of the port mapping (Host:Container). Keep the right side as `5432`.
```yaml
ports:
  - "5433:5432" # Changes local access to port 5433

```


4. To change the database name or password, update the `environment` variables in **both** the `db` service and the `backend` service's `DATABASE_URL` string so the API can still connect.
5. Apply the changes by running:
```bash
docker compose up -d

```



### Scenario C: Complete Database Reset

If your database schema gets corrupted and you need to completely wipe the PostgreSQL data and start fresh:

1. Shut down the containers and delete the data volumes:
```bash
docker compose down -v

```


2. Start the containers back up. A brand new, empty database will be generated.
