# AI Ticket Assistant Backend

This is the backend for the AI Ticket Assistant project, providing RESTful APIs and event-driven automation for managing support tickets, users, and AI-powered workflows.

## Features
- User authentication and authorization
- Ticket creation, management, and assignment
- Admin endpoints for ticket and user oversight
- AI agent integration for ticket triage and response suggestions
- Event-driven background jobs and automation using Inngest (e.g., email notifications)
- MongoDB for persistent data storage

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- Inngest (event-driven workflows)
- JavaScript (ES6+)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   - Create a `.env` file in the root directory with the necessary configuration (e.g., MongoDB URI, JWT secret, email credentials, Inngest keys).
3. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run on the port specified in your environment variables (default: 3000).

## Project Structure
- `src/controllers/` – Route handlers for tickets and users
- `src/models/` – Mongoose models for MongoDB
- `src/routes/` – API route definitions
- `src/middlewares/` – Authentication and other middleware
- `src/utils/` – Utility functions (AI agent, mailer, etc.)
- `src/inngest/` – Inngest client and event-driven function handlers
- `src/index.js` – Entry point for the Express server

## Notes
- This backend is designed to work with the AI Ticket Assistant frontend.
- Ensure MongoDB and Inngest services are accessible for full functionality.
- For development, use tools like Postman to test API endpoints. 