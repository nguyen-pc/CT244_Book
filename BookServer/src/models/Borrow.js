const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BorrowSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  requestDay: {
    type: Date,
    default: () => Date.now(),
  },
  approvedDay: {
    type: Date,
    default: null,
  },
  rejectedDay: {
    type: Date,
    default: null,
  },
  elimiatedDay: {
    type: Date,
    default: null,
  },
  borrowedDay: {
    type: Date,
    default: null,
  },
  borrowedDays: {
    type: Number,
    default: 7,
    min: 7,
    max: 60,
  },
  estimatedReturnDate: {
    type: Date,
    default: null,
  },
  actualReturnDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "returned", "rejected", "overdue", "borrowing", "eliminated"],
    default: "pending",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Borrow", BorrowSchema);
