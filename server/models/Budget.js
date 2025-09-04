
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  total: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: { type: String, default: "rolling" }, // e.g., 'monthly' can be added later
  createdBy: { type: String, required: true } // approver username
}, { timestamps: true });

export default mongoose.model("Budget", budgetSchema);
