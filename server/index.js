
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/requests.js";
import budgetRoutes from "./routes/budgets.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/budgets", budgetRoutes);

// Public dashboard endpoints (no auth)
import Request from "./models/Request.js";
app.get("/api/public/requests", async (req, res) => {
  const requests = await Request.find().sort({ createdAt: -1 }).lean();
  res.json(requests);
});
app.get("/api/public/summary", async (req, res) => {
  const all = await Request.find().lean();
  const total = all.length;
  const fulfilled = all.filter(r => r.status === "Fulfilled");
  const denied = all.filter(r => r.status === "Denied");
  const acknowledged = all.filter(r => r.status === "Acknowledged");
  const pending = all.filter(r => r.status === "Pending");

  const avg = (arr) => {
    if (arr.length === 0) return null;
    const ms = arr.map(r => {
      const start = new Date(r.createdAt).getTime();
      const end = new Date(r.acknowledgedAt || r.fulfilledAt || r.deniedAt || r.updatedAt || r.createdAt).getTime();
      return Math.max(0, end - start);
    });
    const m = ms.reduce((a,b)=>a+b,0)/ms.length;
    return m;
  };
  const avgAckMs = avg(acknowledged);
  const avgFulfillMs = avg(fulfilled);
  const avgDenyMs = avg(denied);

  const valueAdded = fulfilled.reduce((sum, r) => sum + (r.assignedValue || 0), 0);

  const cat = {};
  for (const r of all) {
    const k = r.category || "Unknown";
    cat[k] = cat[k] || { total:0, pending:0, acknowledged:0, denied:0, fulfilled:0, amount:0 };
    cat[k].total++;
    cat[k].amount += (r.amount || 0);
    if (r.status === "Pending") cat[k].pending++;
    if (r.status === "Acknowledged") cat[k].acknowledged++;
    if (r.status === "Denied") cat[k].denied++;
    if (r.status === "Fulfilled") cat[k].fulfilled++;
  }

  res.json({
    totalRequests: total,
    pending: pending.length,
    acknowledged: acknowledged.length,
    denied: denied.length,
    fulfilled: fulfilled.length,
    avgAckMs,
    avgFulfillMs,
    avgDenyMs,
    totalValueAddedByAssignedValue: valueAdded,
    categories: cat
  });
});

const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}
mongoose
  .connect(uri)
  .then(() => {
    app.listen(PORT, () => console.log(`API server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
