# SGM API Interface Contract (v1.1)

This document defines the exact JSON structures the Backend will send and the Frontend will receive. **Do not deviate from these field names or data types.**

## 1. Core Entities

### User Object
Represents a person interacting with the system (Students, Dispatchers, or Technicians).
*(Security Note: The backend must NEVER include the `password_hash` in this object).*

```json
{
  "id": "integer",
  "name": "string",
  "email": "string",
  "role": "User | Dispatcher | Technician",
  "specialty": "string | null",
  "avatarUrl": "string | null", 
  "createdAt": "iso-8601-date"
}
```
*Note: `specialty` is used by the Dispatcher to assign tasks appropriately based on the technician's skills.*

### Ticket Object
Represents a maintenance incident reported on campus.

```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "status": "Open | Assigned | In Progress | Resolved | Confirmed | Closed | Blocked",
  "priority": "Low | Medium | High",
  "slaDeadline": "iso-8601-date | null",
  "creatorId": "integer",
  "assignedTechnicianId": "integer | null",
  "evidence": [
    {
      "id": "integer",
      "url": "string",
      "comment": "string | null",
      "uploadedAt": "iso-8601-date"
    }
  ],
  "createdAt": "iso-8601-date",
  "updatedAt": "iso-8601-date"
}
```
*Notes:* * *The `status` flow must strictly follow: Open -> Assigned -> In Progress -> Resolved -> Confirmed -> Closed.*
* *The "Blocked" status is used specifically if physical parts/inventory are missing.*
* *Because evidence is now a separate table, `evidence` is returned as an array of objects to support multiple photos.*

### Audit Log Object (History)
Represents a single state change in a ticket's lifecycle.

```json
{
  "id": "integer",
  "ticketId": "integer",
  "previousStatus": "string | null",
  "newStatus": "string",
  "changedByUserId": "integer",
  "comment": "string | null",
  "changedAt": "iso-8601-date"
}
```

---

## 2. Primary Endpoints (REST API)

Mathew will build these, and Carlo will fetch from them.

* **`POST /api/auth/login`**
    * **Accepts:** `{ email, password }`
    * **Returns:** `{ token, user: User Object }`
* **`GET /api/tickets`**
    * **Returns:** An array of `Ticket Objects`. *(Can accept query params like `?status=Open` for the Dispatcher dashboard).*
* **`POST /api/tickets`**
    * **Accepts:** `{ title, description, priority, images: [{ url, comment }] }`
    * **Returns:** The newly created `Ticket Object` with status "Open".
* **`PUT /api/tickets/:id/status`**
    * **Accepts:** `{ newStatus, comment }`
    * **Returns:** The updated `Ticket Object`. Used heavily by technicians and the Dispatcher.
* **`GET /api/tickets/:id/history`**
    * **Returns:** An array of `Audit Log Objects` for a specific ticket to display its timeline