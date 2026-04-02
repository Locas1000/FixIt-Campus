# FixIt Campus (SGM) - Frontend Architecture & Guidelines

This document outlines the technical architecture, styling strategy, and component design patterns for the FixIt Campus frontend application.

## 1. Core Technology Stack
* **Framework:** React (Bootstrapped via Vite)
* **Styling Framework:** Bootstrap 5
* **CSS Preprocessor:** SCSS (SASS)
* **Design Language:** Linear-inspired (Minimalist, high-contrast, strictly mobile-first)

## 2. Global Styling Strategy
We do not write generic CSS overrides to customize Bootstrap. Instead, we alter Bootstrap's fundamental DNA using SCSS variable interception.

All global styling is managed in `src/styles/index.scss`.
* **Typography:** The application strictly uses the `Inter` font family.
* **Borders:** Bootstrap's default bubbly borders (`border-radius`) are overwritten to sharp, modern pixel values (e.g., `4px`).
* **Execution Order:** Custom SASS variables MUST be declared at the top of `index.scss` before the core Bootstrap library is imported.

## 3. Directory Structure
To maintain a clear separation of concerns between visual components and business logic, the `src/` directory is strictly organized as follows:

* `assets/`: Static visual files (images, global SVGs).
* `components/`: Reusable, "dumb" UI elements (Buttons, Inputs, TicketCards).
* `layouts/`: Structural wrappers that manage responsive grids (e.g., DashboardLayout).
* `pages/`: Stateful route components that map to specific views (e.g., Dashboard, Login).
* `services/`: The API communication layer handling all backend fetch requests.
* `hooks/`: Custom React hooks for isolated logic.
* `context/`: Global React Context providers (e.g., Authentication state).
* `styles/`: Global SASS variables and the Bootstrap import engine.
* `utils/`: Pure helper functions (date formatters, status color mappers).

## 4. Layout Architecture: The Responsive Master-Detail Pane
The application centers around a 3-pane layout (Sidebar, Ticket List, Ticket Detail). Because our field technicians rely entirely on mobile devices, this layout MUST be responsively dynamic.

* **Desktop (Dispatcher View):** All three panes are visible simultaneously side-by-side.
* **Mobile (Technician View):** Only one pane is visible at a time. The UI relies on component transitions (Sidebar -> List -> Detail) to navigate.

## 5. State Management
For the initial MVP, complex application state (such as the currently selected ticket) is managed using React's native `useState` hook via the "Lifting State Up" pattern.

* State is declared in the highest common parent component (e.g., `Dashboard.jsx`).
* State setter functions (`setSelectedTicket`) are passed down as props to list components.
* State values (`selectedTicket`) are passed down as props to detail view components to trigger dynamic re-renders.
* URL routing for individual tickets is deferred to a future iteration.
