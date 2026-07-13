# HEALTH-02 — Doctor Discovery Portal Frontend

This is the React + Vite frontend application for **HEALTH-02**, a role-based healthcare article portal and clinic listing discovery platform.

## Features
- **Client Dashboard**: Browse nearby clinics, review local directories, and read medical articles.
- **Doctor Dashboard**: Manage medical practices and draft health/medical publications.
- **Admin Dashboard**: Manage user validation queues, verify doctor credentials, and moderate articles.

## Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended)

### 2. Installation
Install the necessary NPM modules:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the frontend root and set the API base URL to target the Django server:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run Development Server
```bash
npm run dev
```
The website will start running on [http://localhost:3000/](http://localhost:3000/).
