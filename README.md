# Employee Management & CV Generation System 🚀

A full-stack professional profile management system that allows for employee registration, secure account claiming, and automated CV generation. Built with the PERN stack (PostgreSQL, Express, React, Node.js).

## 🌟 Key Features
* **Dynamic Profile Creation:** Comprehensive forms for education, training, and employment history.
* **CV Generation:** Automatically generate professional CVs based on stored employee data.
* **Secure Authentication:** Integrated JWT-based login and password hashing using `bcrypt`.
* **Legacy Data Handling:** Intelligent system to detect and migrate legacy employee records to secure hashed accounts.
* **Image Uploads:** Profile picture management via `multer`.
* **Responsive Design:** Fully responsive UI built with Tailwind CSS and Lucide icons.

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Axios, Lucide-React.
* **Backend:** Node.js, Express.js, PostgreSQL (pg-pool).
* **Security:** JSON Web Tokens (JWT), BcryptJS.
* **File Handling:** Multer.

---

## 📂 Project Structure
```text
/
├── frontend/        # React + Vite application
├── backend/         # Express API & Database logic
└── README.md
