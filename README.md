# Unified Job-Card System (MERN) — Minimal MVP

A simple web app to create and track vehicle service Job Cards (2W/4W) with role-based auth, Kanban, mock inventory, and on-screen bill generation.

## Tech Stack

- **Frontend**: React (plain JavaScript)
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Development**: nodemon, git

## Features

- Role-based authentication (service_advisor, technician, cashier, manager)
- Service Advisor: Create Job Cards (customer name, vehicle type, vehicle no)
- Technician: Post updates with status, notes, and criticalIssue flag
- Kanban view: Grouped columns (new, in_progress, waiting_auth, done)
- Cashier: Add parts from mock inventory and generate bills
- Bill generation: Parts total + fixed labour + 18% GST

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Demo Script (5 minutes)

1. **Start Backend and Frontend** (follow setup instructions above)

2. **Login as Manager**:
   - Register a new user with role `manager` or use existing credentials
   - Login to access the dashboard

3. **As Service Advisor**:
   - Create a Job Card with customer name, vehicle type (2W/4W), and vehicle number
   - Verify it appears in the "New" column of Kanban board

4. **As Technician**:
   - Login as technician
   - Open a job card from Kanban
   - Add an update: Set status to "In Progress"
   - Mark a criticalIssue flag → Card moves to "Waiting Auth" column

5. **Manager Authorization**:
   - Manager logs in and authorizes the waiting job card (set status back to in_progress)

6. **Technician Completion**:
   - Technician completes the job and sets status to "Done"
   - Card moves to "Done" column

7. **Cashier - Add Parts & Generate Bill**:
   - Login as cashier
   - Open a job card
   - Add parts from the mock inventory
   - Generate Bill → View parts total + labour + 18% GST on screen

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Job Cards
- `POST /api/jobcards` - Create job card (auth required)
- `GET /api/kanban` - Get grouped job cards for Kanban (auth required)
- `GET /api/jobcards/:id` - Get job card details (auth required)
- `POST /api/jobcards/:id/updates` - Add update (technician only)
- `POST /api/jobcards/:id/parts` - Add parts (cashier only)
- `GET /api/jobcards/:id/bill` - Get bill JSON (labour + GST)

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory?q=CODE` - Search inventory by code

## Project Structure

```
psgss/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── README.md
```

## Git Commits

The project follows these commit phases:
- `phase-0-init`: Repo skeleton and README
- `phase-1-auth`: Register/login + JWT
- `phase-2-jobcards`: Jobcard models + create/list/get + kanban
- `phase-3-inventory-billing`: Mock inventory + parts + bill generation
- `phase-4-frontend`: React app with auth, kanban, create jobcard
- `phase-5-demo-ready`: Jobcard detail, updates, parts UI, demo polish

## Notes

- This is a minimal MVP for demonstration purposes
- Mock inventory API is included in the backend (replaceable with real API later)
- Local-only demo; simple UI is acceptable
- Plain JavaScript (no TypeScript)

