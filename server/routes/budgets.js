
import express from "express";
import Budget from "../models/Budget.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Approver can create/update latest budget
router.post("/", verifyToken, requireRole("approver"), async (req, res) => {
  const { total } = req.body;
  if (typeof total !== "number") return res.status(400).json({ error: "total required number" });
  const b = new Budget({ total, createdBy: req.user.username });
  await b.save();
  res.status(201).json(b);
});

router.get("/latest", async (req, res) => {
  const b = await Budget.findOne().sort({ createdAt: -1 }).lean();
  res.json(b || null);
});

export default router;
