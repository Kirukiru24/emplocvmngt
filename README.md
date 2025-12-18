🚀 Getting Started1. PrerequisitesNode.js (v16+)PostgreSQL databasenpm or yarn2. Database SetupCreate a PostgreSQL database and execute your schema. Ensure you have tables for:employeeseducationtrainingsemployment_history3. Backend SetupBashcd backend
npm install
Create a .env file in the /backend folder:Code snippetPORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/your_db
JWT_SECRET=your_secret_key
Start backend: npm run dev (or node server.js)4. Frontend SetupBashcd frontend
npm install
Update your API base URL in src/services/api.js if necessary.Start frontend: npm run dev📡 API Endpoints (Quick Reference)MethodEndpointDescriptionPOST/api/employeesCreate new employee / Claim accountPOST/api/employees/loginEmployee login (JWT)GET/api/employeesList all employeesGET/api/employees/:idGet full profile detailPUT/api/employees/:idUpdate profile information📝 LicenseThis project is for internal use at ALTA Computec PLC.
---

### Tips for a "Powerful" README:
1.  **Add Screenshots:** Under the "Key Features" section, add a screenshot of your `EmployeeForm` using `![Form Screenshot](./path-to-image.png)`.
2.  **Usage Instructions:** If you have specific validation rules (like the password requirement), mention them in the "Getting Started" section.
3.  **Future Roadmap:** Add a section for "Coming Soon" (e.g., "Export to PDF", "Admin Dashboard") to show you are thinking about the project's growth.

