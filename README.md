# HelpDesk Lite

A lightweight internal support ticketing system built with React, Node.js, Express, and MySQL.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT + bcrypt

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Configure environment

Copy `.env.example` to `.env` in the project root and update your MySQL credentials:

```bash
cp .env.example .env
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Create database and seed data

```bash
npm run db:setup
```

### 4. Start the server

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## Seed Accounts

All accounts use password: **Password123!**

| Name  | Email                                         | Password     |
| ----- | --------------------------------------------- | ------------ |
| Alice | [alice@company.com](mailto:alice@company.com) | Password123! |
| Carol | [carol@company.com](mailto:carol@company.com) | Password123! |
| Eve   | [eve@company.com](mailto:eve@company.com)     | Password123! |

## Project Structure

```
HelpDesk/
├── client/          # React frontend (Phase 4+)
├── server/          # Express API
├── database/        # SQL schema
└── .env             # Environment variables
```

## API Health Check

```
GET http://localhost:5000/api/health
```

## Auth API (Phase 2)

```
POST /api/auth/login     # Body: { email, password } → { token, user }
GET  /api/auth/me        # Requires Authorization: Bearer <token>
```
