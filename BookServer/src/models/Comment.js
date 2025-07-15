const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    require: true,
  },
  text: {
    type: String,
    require: true,
    trim: true,
  },
}, {
  timestamps: true,
});
module.exports = mongoose.model("Comment", CommentSchema);
