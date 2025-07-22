const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BorrowSchema = new Schema({
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
  requestDate: {
    type: Date,
    default: () => Date.now(),
  },
  approvedDate: {
    type: Date,
    default: null,
  },
  rejectedDate: {
    type: Date,
    default: null,
  },
  eliminatedDate: {
    type: Date,
    default: null,
  },
  borrowedDate: {
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
    enum: [
      "pending",
      "approved",
      "returned",
      "rejected",
      "overdue",
      "borrowing",
      "eliminated"
    ],
    default: "pending",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Borrow", BorrowSchema);
