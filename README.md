# UPI Scam / Fraud Reporting Portal 🚨

A web-based **UPI Scam and Digital Payment Fraud Reporting Portal** that allows users to register, log in, submit fraud reports, upload evidence, manage their reports, and track the status of reported incidents.

The system also provides an **Admin role** that can view and manage reports submitted by all users.

---

## 📌 Project Overview

Digital payments such as UPI have made transactions fast and convenient, but they have also increased the risk of scams and fraudulent activities.

This project provides a centralized platform where users can:

* Create an account
* Log in securely
* Report UPI scams or fraud incidents
* Submit transaction and incident details
* Upload supporting evidence
* View their submitted reports
* Update or delete their reports
* Track report status
* View dashboard statistics
* Export reports as CSV

Administrators can view and manage reports submitted by all users.

---

## ✨ Features

### 👤 User Authentication

* User registration
* User login
* Session-based authentication
* Logout
* Current-user information
* Password hashing using bcrypt

### 🚨 Fraud Reporting

Users can submit:

* Reporter name
* Contact information
* Incident date
* Transaction ID
* Fraud amount
* Incident type
* Description
* Additional information
* Supporting evidence

### 📎 Evidence Upload

The application supports evidence uploads in:

* JPG
* PNG
* WEBP
* PDF

Maximum file size:

```text
5 MB
```

### 📋 Report Management

Users can:

* View their reports
* View individual reports
* Update their reports
* Delete their reports

Administrators can manage reports across all users.

### 📊 Dashboard

The dashboard provides:

* Total reports
* New reports
* Reports under review
* Resolved reports
* Total reported amount

### 📥 CSV Export

Reports can be exported as a CSV file for further analysis.

---

# 🛠️ Technologies Used

## Backend

* Node.js
* Express.js
* SQLite
* bcryptjs
* express-session
* Multer

## Frontend

* HTML
* CSS
* JavaScript

## Database

```text
SQLite
```

## API Testing

```text
Postman
```

---

# 📂 Project Structure

```text
UPI-Fraud-Portal/
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── ...
│
├── uploads/
│   └── uploaded evidence files
│
├── fraud.db
│
├── code.js
├── package.json
└── README.md
```

> The exact frontend files may differ depending on your project structure.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

Move into the project directory:

```bash
cd YOUR-REPOSITORY
```

---

## 2. Install Dependencies

Run:

```bash
npm install
```

The project uses packages including:

```text
express
sqlite3
sqlite
express-session
bcryptjs
multer
```

---

# ▶️ Run the Project

Start the server using:

```bash
node code.js
```

If everything is working correctly, you should see:

```text
Database connected
Server running at http://localhost:3000
```

Open the application in your browser:

```text
http://localhost:3000
```

---

# 🔐 Demo Accounts

The application automatically creates demo accounts when the database is initialized.

## Admin

```text
Email: admin@example.com
Password: admin123
```

## User

```text
Email: user@example.com
Password: user123
```

> These are demo credentials for development/testing. Change them before using the application in a real deployment.

---

# 🔌 API Endpoints

Base URL:

```text
http://localhost:3000
```

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/api/register`    | Register a new user        |
| POST   | `/api/login`       | Login                      |
| GET    | `/api/me`          | Get current logged-in user |
| POST   | `/api/logout`      | Logout                     |
| GET    | `/api/reports`     | Get reports                |
| GET    | `/api/reports/:id` | Get a specific report      |
| POST   | `/api/reports`     | Create a fraud report      |
| PUT    | `/api/reports/:id` | Update a report            |
| DELETE | `/api/reports/:id` | Delete a report            |
| GET    | `/api/dashboard`   | Get dashboard statistics   |
| GET    | `/api/export`      | Export reports as CSV      |

---

# 🧪 Testing with Postman

## Register

### Request

```text
POST /api/register
```

### Body

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "rahul123"
}
```

---

## Login

### Request

```text
POST /api/login
```

### Body

```json
{
  "email": "rahul@example.com",
  "password": "rahul123"
}
```

The application uses a session cookie after successful login.

---

## Get Reports

```text
GET /api/reports
```

Login is required.

---

## Create Fraud Report

```text
POST /api/reports
```

Use:

```text
Body → form-data
```

Example fields:

```text
reporter_name    Rahul
contact          9876543210
incident_date    2026-08-16
transaction_id   UPI123456789
amount           5000
incident_type    UPI Fraud
description      Money was transferred without permission
additional_info  Suspicious payment request
```

Evidence can also be uploaded using the:

```text
evidence
```

field.

---

## Get Single Report

```text
GET /api/reports/1
```

Replace `1` with the actual report ID.

---

## Update Report

```text
PUT /api/reports/1
```

Example JSON:

```json
{
  "reporter_name": "Rahul",
  "contact": "9876543210",
  "incident_date": "2026-08-16",
  "transaction_id": "UPI123456789",
  "amount": 5000,
  "incident_type": "UPI Fraud",
  "description": "Updated fraud description",
  "additional_info": "Additional information",
  "status": "New"
}
```

---

## Delete Report

```text
DELETE /api/reports/1
```

---

## Dashboard

```text
GET /api/dashboard
```

Example response:

```json
{
  "total": 5,
  "newReports": 2,
  "underReview": 1,
  "resolved": 2,
  "totalAmount": 25000
}
```

---

## Export Reports

```text
GET /api/export
```

This generates:

```text
fraud-reports.csv
```

---

# 👥 User Roles

## User

A normal user can:

```text
Register
   ↓
Login
   ↓
Create Fraud Report
   ↓
View Own Reports
   ↓
Update Own Reports
   ↓
Delete Own Reports
   ↓
View Dashboard
   ↓
Export Own Reports
```

## Admin

An administrator can:

```text
Login
   ↓
View All Reports
   ↓
View Individual Reports
   ↓
Update Reports
   ↓
Change Report Status
   ↓
Delete Reports
   ↓
View Overall Dashboard
   ↓
Export Reports
```

---

# 📊 Report Status

Reports can have the following statuses:

```text
New
Under Review
Resolved
Rejected
```

New reports are automatically assigned:

```text
New
```

Administrators can update the report status.

---

# 🗄️ Database

The application uses SQLite with a database file:

```text
fraud.db
```

### Users Table

Stores:

* User ID
* Name
* Email
* Hashed password
* Role
* Account creation date

### Reports Table

Stores:

* Report ID
* Reporter name
* Contact
* Incident date
* Transaction ID
* Amount
* Incident type
* Description
* Additional information
* Status
* User ID
* Evidence path
* Evidence name
* Creation date

---

# 🔒 Security Features

The application includes:

* Password hashing using bcrypt
* Session-based authentication
* User ownership checks
* Admin role checking
* File type validation
* File size limitation
* Protected API endpoints

Users cannot access another user's reports through the protected report APIs.

---

# 🚀 Future Improvements

Possible improvements include:

* Email notifications
* OTP-based verification
* Admin analytics dashboard
* Advanced report filtering
* Search by transaction ID
* Report status notifications
* Fraud category classification
* Fraud trend charts
* Integration with official cybercrime reporting systems
* Improved authentication using JWT
* Cloud storage for evidence
* Deployment to a cloud platform
* Responsive mobile interface

---

# 🎯 Project Objective

The main objective of this project is to provide a simple digital platform for recording and managing UPI fraud incidents while demonstrating important full-stack development concepts such as:

```text
Frontend
   ↓
REST API
   ↓
Authentication
   ↓
Database
   ↓
File Upload
   ↓
Report Management
   ↓
Admin Dashboard
```

---

# 📚 Learning Outcomes

This project demonstrates practical experience with:

* Node.js
* Express.js
* REST APIs
* CRUD operations
* SQLite database
* User authentication
* Session management
* Password hashing
* File uploads
* Role-based access
* API testing with Postman
* Frontend-backend integration

---

# ⚠️ Disclaimer

This project is intended for **educational and demonstration purposes**.

It is not a replacement for official UPI, banking, police, or government cybercrime reporting systems.

Do not upload real sensitive financial information while testing the application.

---

# 👨‍💻 Author

**Rahul**

Computer Science & Engineering Student

---

## ⭐ If you found this project useful

Give the repository a ⭐ on GitHub!
