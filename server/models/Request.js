
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  category: { type: String, required: true },
  title: { type: String }, // required when category is "Wild Card"
  amount: { type: Number, required: true },
  approvalDeadline: { type: Date, required: true },
  description: { type: String },
  suggestedMethod: { type: String, enum: ["Gift Card", "Prepaid Card", "Vendor Payment", "Other"], required: true },
  customMethod: { type: String },
  recurring: { type: Boolean, default: false },
  assignedValue: { type: Number, min: 1, max: 10, required: true },

  status: { type: String, enum: ["Pending", "Acknowledged", "Denied", "Fulfilled"], default: "Pending" },
  denialReason: { type: String },
  fulfillmentProof: { type: String },

  acknowledgedAt: { type: Date },
  fulfilledAt: { type: Date },
  deniedAt: { type: Date },

  createdBy: { type: String, required: true }, // username of requester
  updatedBy: { type: String }
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
