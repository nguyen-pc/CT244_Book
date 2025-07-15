const Comment = require("../models/Comment");

async function Create(req, res) {
  const { user, book, text } = req.body;

  if (!user || !book || !text) {
    return res.status(422).json({ message: "Invalid field" });
  }

  try {
    await Comment.create({
      user,
      book,
      text,
    });
    return res.sendStatus(201);
  } catch (e) {
    return res
      .status(400)
      .json({ message: "Could not comment", error: e.message });
  }
}

async function getAllComment(req, res) {
  try {
    const comments = await Comment.find().populate("user", "username").exec();
    return res.status(200).json(comments);
  } catch (e) {
    console.error("Error retrieving comment:", e);
    return res
      .status(500)
      .json({ message: "Could not retrieve comment", error: e.message });
  }
}

async function editComment(req, res) {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const { text } = req.body;
    const comment = await Comment.findById(commentId);
    if (text.trim() === "" || !text) {
      return res.status(400).json({ msg: "Text is required" })
    }
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }
    console.log(`${userId} ${comment.user.toString()}`);
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: Not your comment" })
    }
    comment.text = text
    await comment.save()
    console.log(comment.updatedAt);
    return res.status(200).json({ message: "Comment deleted successfully", comment })

  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" })
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = req.params.commentId;
    const user = req.user
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    if (comment.user.toString() !== user.id) {
      return res.status(403).json({ message: "Forbidden: Not your comment" })
    }
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({ message: "Comment deleted successfully" })
  } catch (e) {
    return res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = { Create, getAllComment, editComment, deleteComment };
