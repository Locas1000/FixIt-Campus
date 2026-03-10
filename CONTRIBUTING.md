# Contributing to SGM (Sistema de Gestión de Mantenimiento)

Welcome to the team! This document outlines the technical workflow we follow to ensure our `main` branch stays stable and our codebase remains clean.

## 1. Local Environment Setup
To eliminate the "it works on my machine" problem, we rely on Docker.
To spin up the local development environment, simply run:
`docker-compose up -d`

## 2. Branching Strategy (GitHub Flow)
We follow a strict GitHub Flow strategy to ensure our main code is always functional.
When you take an Issue from the "Ready" column on our Kanban board:
1. Always create your local branch branching off from `main` (or `develop`).
2. Use the following naming convention for your branch: `feat/nombre-de-la-tarea`.
    * *Example:* `feat/upload-photos`

## 3. Commit Standards
We keep our repository clean by following the Conventional Commits standard.
Please format your commit messages like this: `type: description`
* `feat:` A new feature for the user.
* `fix:` A bug fix.
* `docs:` Changes to the documentation.
* `chore:` Updating dependencies, configurations, etc.
* *Example:* `feat: add camera access to ticket form`

## 4. Pull Requests and Code Review
Extreme Programming (XP) practices are in effect. **No code goes into the main branch without a review**.
1. Verify that your project compiles locally and doesn't break previous features.
2. Push your branch to GitHub and open a Pull Request (PR).
3. Link your PR to the specific Issue on the GitHub Projects board.
4. Wait for an approval review from the Tech Lead or another team member before merging.