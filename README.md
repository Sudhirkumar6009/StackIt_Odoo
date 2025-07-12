# StackIt – A Minimal Q&A Forum Platform

A lightweight, collaborative, and user-friendly Q&A Forum Platform built for structured knowledge sharing. Powered by React, Express.js, MongoDB, and enriched with a Rich Text Editor using TipTap.

---
## Overview
**StackIt** is a minimalistic question-and-answer platform designed to foster community learning. Whether you're a student, developer, or enthusiast, StackIt provides a clean and functional environment to ask, answer, and discuss technical or domain-specific queries. Inspired by platforms like Stack Overflow, StackIt focuses on simplicity, clarity, and performance.

---
## Features
-  **Rich Text Editor Integration (TipTap)**

-  **User Authentication & Authorization**

-  **Create, Edit, Delete Questions & Answers**

-  **Search and Tag-Based Filtering**

-  **Comment System for Community Interaction**

-  **Profile Management and Activity Tracking**

-  **RESTful API with Express.js**

-  **MongoDB-based Persistent Storage**

---

## Checkout latest Deployment

Coming soon..

---

## 🛠 Tech Stack

| Layer         | Technologies Used                    |
|---------------|---------------------------------------|
| Frontend      | React.js, Tip-Tap (Editor), Tailwind CSS    |
| Backend       | Node.js, Express.js     |
| Database       | MongoDB (Mongoose ODM)     |
| Auth       | JWT Authentication, Bcrypt.js               |
| API Type| REST API               |

---

## Getting Started
### 1. Clone the Repo.
Follow command :
```bash
git clone https://github.com/Sudhirkumar6009/StackIt_Odoo.git
cd ./StackIt_Odoo
```
### 2. Install Dependencies
Install dependencies on both frontend and backend : 
```bash
npm install
```
### 3. Run Locally Development
3.1. For `./frontend` use this command : 
```bash
npm run dev
```
3.2. For `./backend` use this command : 
```bash
nodemon
```
### Now your Development is live on local port :8080

**Important** Development uses some environment variables for both frontend and backend. User needs to add `.env` file on both directories and provide KEYS as follows : 

### Frontend Environment Variables
|NAME|INFORMATION|
|----|-----------|
|VITE_BACKEND_PORT_URL|http://localhost:3001 *Backend server*|
|VITE_GOOGLE_CLIENT_ID|XXXX.apps.googleuserscontent.com *Used for GoogleOAuth*|
|VITE_INFURA_ID| XXXX (32 char) *Web3 Wallet Connection*|

### Backend Environment Variables
|NAME|INFORMATION|
|----|-----------|
|ATLAS_URI|mongodb+srv://XX:XX...mongodb.net.. *MongoDB Atlas*|
|BACKEND_PORT_URL|http://localhost:3001 *Backend server*|
|FILEBASE_ACCESS_KEY| XXXX *Used for Filebase access*|
|FILEBASE_BUCKET| {bucket_name} *Used for Filebase access x2*|
|FILEBASE_ENDPOINT| https://s3.filebase.com *Used for Filebase file access x3*|
|FILEBASE_SECRET_KEY| XXXX *Used for Filebase access x4*|
|SECRET_KEY| XXXX *Used for Encryption-Decryption of Profile Info*|

### Contact
For questions or issues,
MAIL ME : sudhir.kuchara@gmail.com :)

