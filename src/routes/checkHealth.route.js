import express from "express";
import { checkHealth } from "../controllers/checkHealth.controller.js";

const router = express.Router();

router.get("/", checkHealth);

export default router;
