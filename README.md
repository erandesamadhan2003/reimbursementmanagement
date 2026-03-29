# ExpenseFlow - Reimbursement Management
**Odoo x VIT Pune Hackathon 26**

ExpenseFlow is a modern, intelligent React-based Reimbursement Management System. It features OCR receipt scanning, real-time analytics and seamless role-based routing tailored for Employees, Managers, and Administrators.

## Team Members
- **Samadhan Erande**
- **Harsha Agrawal**
- **Shantanu Sawant**
- **Atharva Patil**

---

## How to Run the Project

This application is split into two parts: a Node.js/Express `backend` and a Vite/React `frontend`.

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a remote URI)

### 1. Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Create a `.env` file in the `backend/` directory based on `.env.example`.
   - Make sure your MongoDB URI (`MONGO_URI`) and JWT Secret (`JWT_SECRET`) are configured.
4. **OPTIONAL BUT RECOMMENDED**: Seed the database with 100+ realistic expenses and test users to properly test the application:
   ```bash
   npm run seed
   ```
   *Login credentials for the seeded admin will be printed in the console.*
5. Start the server (runs on port 5000 by default):
   ```bash
   npm run dev
   ```

### 2. Start the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (optional if using defaults):
   - Make sure the API is pointing to `http://localhost:5000/api` in the frontend config.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173/` 🚀