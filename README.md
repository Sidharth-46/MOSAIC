# MOSAIC

Multi-source Observation System for Analytics, Intelligence & Crime

## Setup

This project runs natively using Python and Node.js. It is designed to be fully modular and ready for deployment via **Zoho Catalyst**.

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up your Python virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend natively using Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will be available at http://localhost:8000*

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at http://localhost:5173*

## Zoho Catalyst Deployment

The application is structured to be deployed using Zoho Catalyst. The backend can be deployed as Advanced I/O functions or Serverless functions, and the frontend can be deployed as Web Client hosting. 
Data layers have already been migrated to utilize the Zoho Catalyst Data Store and SDK.
