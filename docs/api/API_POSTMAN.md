
#  FixIt Campus API - Developer Guide

Welcome to the interactive API documentation for FixIt Campus. We are using a live Postman collection to standardize our backend testing and make frontend integration as seamless as possible. 

Because this is a live link, any new routes added by the backend team will automatically appear here!

##  1. How to Access the Live Collection

Instead of downloading static files, you can access our live workspace directly:
1. Download the [Postman App](https://www.postman.com/downloads/) or use the web version.
2. Click this link to join our collection: [here](https://lucascastineiras100-2910757.postman.co/workspace/IDS~c4cd4000-5f21-4db9-89d4-0ac42e7f2de3/collection/50797284-d6abcfd8-b0bd-4797-b2a5-29458ea8cb7b?action=share&source=copy-link&creator=50797284)
3. The "FixIt Campus API" collection will now appear in your workspace and stay synced automatically.

## 2. Environment Variables (Important)

To avoid hardcoding `localhost` on every single request, this collection uses a collection variable called `{{base_url}}`. 
* **Frontend (Carlo):** Make sure your local `fetch` or `axios` calls are pointed to this same port (`http://localhost:5000`).
* **Note:** When we eventually deploy the API to a production server, we will simply update this `{{base_url}}` variable in Postman, and all our test routes will update instantly.

##  3. Authentication Status

**Currently Disabled:** To unblock the frontend team and speed up initial development, **there is no JWT authentication or middleware required at this time.** You can hit the endpoints directly without needing a Bearer Token. (Role-based access control will be added in a future sprint).

##  4. Available Routes (Sprint 1)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Fetches the full list of maintenance tickets directly from the PostgreSQL database. | No |

*(This table will grow as we build out the POST, PUT, and Auth controllers!)*