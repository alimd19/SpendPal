
import express from "express";
import Request from "../models/Request.js";
import Budget from "../models/Budget.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

// Create (Ali only)
router.post("/", verifyToken, requireRole("requester"), async (req, res) => {
  try {
    const data = req.body;
    if (data.category === "Wild Card" && !data.title) {
      return res.status(400).json({ error: "Title required for Wild Card category" });
    }
    const doc = new Request({
      ...data,
      createdBy: req.user.username,
      updatedBy: req.user.username
    });
    await doc.save();

    // Notify Afee
    await sendEmail(process.env.NOTIFY_APPROVER_EMAIL || "approver@example.com",
      "New SpendPal request",
      `A new request was submitted by ${req.user.username}: ${doc.category} - $${doc.amount}`);

    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all (private feed for users)
router.get("/", verifyToken, async (req, res) => {
  const docs = await Request.find().sort({ createdAt: -1 }).lean();
  res.json(docs);
});

// Update status by approver
router.patch("/:id/status", verifyToken, requireRole("approver"), async (req, res) => {
  try {
    const { status, denialReason, fulfillmentProof } = req.body;
    const doc = await Request.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    if (!["Acknowledged", "Denied", "Fulfilled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    doc.status = status;
    if (status === "Acknowledged") doc.acknowledgedAt = new Date();
    if (status === "Denied") { doc.deniedAt = new Date(); doc.denialReason = denialReason || "No reason provided"; }
    if (status === "Fulfilled") { doc.fulfilledAt = new Date(); doc.fulfillmentProof = fulfillmentProof || doc.fulfillmentProof; }

    doc.updatedBy = req.user.username;
    await doc.save();

    // budget spent increment when fulfilled
    if (status === "Fulfilled") {
      const budget = await Budget.findOne().sort({ createdAt: -1 });
      if (budget) {
        budget.spent += (doc.amount || 0);
        await budget.save();
      }
    }

    // Notify Ali
    await sendEmail(process.env.NOTIFY_REQUESTER_EMAIL || "requester@example.com",
      `Your request was ${status}`,
      `Request ${doc._id} updated to ${status}.`);

    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Requester can mark as used (and auto re-submit if recurring)
router.post("/:id/mark-used", verifyToken, requireRole("requester"), async (req, res) => {
  try {
    const doc = await Request.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.status !== "Fulfilled") return res.status(400).json({ error: "Only fulfilled requests can be marked used" });

    // Auto-resubmit if recurring
    let newDoc = null;
    if (doc.recurring) {
      newDoc = new Request({
        category: doc.category,
        title: doc.title,
        amount: doc.amount,
        approvalDeadline: req.body.nextApprovalDeadline || new Date(Date.now() + 7*24*3600*1000),
        description: doc.description,
        suggestedMethod: doc.suggestedMethod,
        customMethod: doc.customMethod,
        recurring: true,
        assignedValue: doc.assignedValue,
        status: "Pending",
        createdBy: doc.createdBy,
        updatedBy: doc.createdBy
      });
      await newDoc.save();
    }

    res.json({ message: "Marked used", autoResubmitted: !!newDoc, newRequest: newDoc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Requester can update or delete own requests when pending
router.patch("/:id", verifyToken, requireRole("requester"), async (req, res) => {
  try {
    const doc = await Request.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.status !== "Pending") return res.status(400).json({ error: "Only pending requests can be edited" });
    Object.assign(doc, req.body);
    doc.updatedBy = req.user.username;
    await doc.save();
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", verifyToken, requireRole("requester"), async (req, res) => {
  try {
    const doc = await Request.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.status !== "Pending") return res.status(400).json({ error: "Only pending requests can be deleted" });
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
