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

## 3. Naming Convention (Non-Source Code SCIs)
We follow a strict naming convention to ensure our file system has a standard, readable order. This applies to any Software Configuration Item (SCI) that isn't source code (e.g., documents, diagrams, loose scripts).

**The Formula:**
`[PROJECT]-[MODULE]-[TYPE]-[DESCRIPTION]-v[VERSION].[EXT]`

*Example:* `SGM-AUTH-UML-login_sequence-v1.0.png`

### Allowed Abbreviations Table

**Modules:**
| Abbreviation | Meaning |
| :--- | :--- |
| **AUTH** | Authentication & Authorization |
| **TICK** | Ticketing & Incident Management |
| **USER** | User / Roles Management |
| **DB** | Database |
| **UI** | User Interface / Frontend |
| **SYS** | General System Architecture |

**Types:**
| Abbreviation | Meaning |
| :--- | :--- |
| **REQ** | Requirements / Specifications |
| **UML** | Diagrams (UML, ERD, Wireframes) |
| **TST** | Testing (Test cases, QA scripts) |
| **DOC** | General Documentation (Manuals, Notes) |
| **SCR** | Scripts (DB migrations, setup scripts) |

## 4. Commit Standards
We keep our repository clean by following the Conventional Commits standard.
Please format your commit messages like this: `type: description`
* `feat:` A new feature for the user.
* `fix:` A bug fix.
* `docs:` Changes to the documentation.
* `chore:` Updating dependencies, configurations, etc.
* *Example:* `feat: add camera access to ticket form`

## 5. Pull Requests and Code Review
Extreme Programming (XP) practices are in effect. **No code goes into the main branch without a review**.
1. Verify that your project compiles locally and doesn't break previous features.
2. Push your branch to GitHub and open a Pull Request (PR).
3. Link your PR to the specific Issue on the GitHub Projects board.
4. Wait for an approval review from the Tech Lead or another team member before merging.
