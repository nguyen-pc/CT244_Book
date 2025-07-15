const express = require("express");
const commentController = require("../../controllers/commentController");
const authentication = require("../../middleware/authentication");
const router = express.Router();

router.post("/create", commentController.Create);
router.get("/allComment", commentController.getAllComment);
// router.get("/userBorrow/:userId", borrowController.getUserBorrow);
// router.post("/return/:borrowId", borrowController.returnBook);
router.put("/edit/:commentId", authentication, commentController.editComment);
router.delete("/delete/:commentId", authentication, commentController.deleteComment);

module.exports = router;
