import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { getTickets,createTicket,getTicket } from "../controllers/ticket.controller.js"

const router = express.Router();

router.post("/", verifyJWT, createTicket);
router.get("/", verifyJWT, getTickets);
router.get("/:id", verifyJWT, getTicket);

export default router;