#  FixIt Campus API - POSTMAN guide 

Welcome to the API documentation for FixIt Campus. We use a shared Postman collection stored directly in this repository to standardize our backend testing and make frontend integration as seamless as possible.

##  1. How to Import the Collection

To test the backend routes locally without writing any code, follow these steps:
1. Download the [Postman App](https://www.postman.com/downloads/) 
2. Click the **Import** button in the top left corner of your Postman workspace.
3. Drag and drop the `FixIt-Campus-API.postman_collection.json` file located in this repository folder (`docs/api/`).
4. The "FixIt Campus API" collection will now appear in your workspace.

##  2. Environment Variables (Important)

To avoid hardcoding `localhost` on every single request, this collection uses a collection variable called `{{base_url}}`. 
* **Frontend:** Make sure your local `fetch` or `axios` calls are pointed to this same port (`http://localhost:5000`).
* **Note:** When we eventually deploy the API to a production server, we will simply update this `{{base_url}}` variable in Postman, and all our test routes will update instantly.

##  3. Authentication Status

**Currently Disabled:** To unblock the frontend team and speed up initial development, **there is no JWT authentication or middleware required at this time.** You can hit the endpoints directly without needing a Bearer Token. (Role-based access control will be added in a future sprint).

##  4. Available Routes (Sprint 1)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets` | Fetches the full list of maintenance tickets directly from the PostgreSQL database. | No |

*(This table and the Postman JSON file will be updated as the backend team builds out the POST, PUT, and Auth controllers!)*(This table will grow as we build out the POST, PUT, and Auth controllers!)*

##  5. How to Update and Share Changes (For Backend Team)

Since we are collaborating without a paid Postman workspace, we use GitHub as our source of truth. If you add a new route or change an existing one, you **must** update the JSON file for the rest of the team:

1. **Make your changes:** Add the new route, body, or parameters inside your local Postman app and click Save.
2. **Export the Collection:** Click the three dots (`...`) next to the "FixIt Campus API" collection folder in Postman and select **Export** (Choose Collection v2.1).
3. **Overwrite the file:** Save the exported file directly into the `docs/api/` folder of your local repository. **Make sure it perfectly overwrites the existing `FixIt-Campus-API.postman_collection.json` file** (do not create a duplicate with a `(1)` at the end).
4. **Commit and Push:** Commit the updated JSON file to your branch alongside your backend code changes.
5. **Notify the Team:** Once your PR is merged, let the frontend team know they should pull the latest `main` branch and re-import the JSON file into their Postman to see your new routes.