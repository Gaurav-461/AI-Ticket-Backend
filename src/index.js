import express from "express";
import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import dotenv from "dotenv";

dotenv.config()

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/ticket", ticketRoutes);

// Inngest API
app.use("/api/inngest", serve({
  client: inngest,
  functions: [onSignup, onTicketCreated]
}));

// MongoDB connection
mongoose
  .connect(`${process.env.MONGO_URI}${DB_NAME}`)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:3000`)
    );
  })
  .catch((err) => console.log("❌ MongoDB connection error:- ", err));
