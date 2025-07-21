const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const emailService = require("../service/emailService");
const { populate } = require("dotenv");

async function create(req, res) {
  const {
    user,
    book,
    borrowedDays
  } = req.body;

  if (!user || !book) {
    return res.status(422).json({ message: "Invalid field" });
  }

  try {
    // Kiểm tra số lượng sách người dùng đã mượn chưa trả
    const activeBorrows = await Borrow.find({
      user: user,
      status: { $nin: ["returned", "rejected", "eliminated"] }
    });

    if (activeBorrows.length >= 5) {
      return res.status(403).json({
        message: "You have reached the maximum borrow limit (5 books)"
      });
    }

    // Tìm sách và kiểm tra số lượng tồn
    const bookToBorrow = await Book.findById(book);
    if (!bookToBorrow) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Kiểm tra tồn kho
    if (bookToBorrow.number <= 0) {
      return res.status(400).json({ message: "Book is out of stock" });
    }

    // Gửi email nếu cần (đang tắt)
    // await emailService.sendSimpleEmail(email, bookName, estimatedReturnDate);

    // Tạo bản ghi mượn sách
    await Borrow.create({
      user,
      book,
      borrowedDays,
      status: "pending",
      requestDay: new Date(),
    });

    // Cập nhật số lượng sách còn lại
    // bookToBorrow.number -= 1;
    // await bookToBorrow.save();
    // Chưa cập nhật cần chờ approve

    return res.sendStatus(201);
  } catch (e) {
    return res
      .status(400)
      .json({ message: "Could not create borrow", error: e.message });
  }
}


async function updateStatus(req, res) {
  const { borrowId, status } = req.body;
  const validStatuses = [
    "pending",
    "approved",
    "borrowing",
    "returned",
    "rejected",
    "overdue",
    "eliminated",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    const now = new Date();

    if (["returned", "rejected", "eliminated"].includes(borrow.status)) {
      return res.status(400).json({ message: `Cannot change status from ${borrow.status}` });
    }

    // Process each status change
    switch (status) {
      case "approved": {
        if (borrow.status !== "pending") {
          return res.status(400).json({ message: "Only pending requests can be approved" });
        }
        const book = await Book.findById(borrow.book);
        if (!book || book.number <= 0) {
          return res.status(400).json({ message: "Book is out of stock or not found" });
        }
        book.number -= 1;
        await book.save();

        borrow.approvedDay = now;
        break;
      }
      case "rejected":
        if (borrow.status !== "pending") {
          return res.status(400).json({ message: "Only pending requests can be rejected" });
        }
        borrow.rejectedDay = now;
        break;

      case "borrowing":
        if (borrow.status !== "approved") {
          return res.status(400).json({ message: "Only approved requests can be borrowed" });
        }
        borrow.borrowedDay = now;
        borrow.estimatedReturnDay = new Date(
          now.getTime() + borrow.borrowedDays * 24 * 60 * 60 * 1000
        );
        break;

      case "returned": {
        if (!["borrowing", "overdue"].includes(borrow.status)) {
          return res.status(400).json({ message: "Only borrowing requests can be returned" });
        }
        borrow.returnedDay = now;
        const book = await Book.findById(borrow.book);
        if (book) {
          book.number += 1;
          await book.save();
        }
        break;
      }
    }

    // Update status after processing
    borrow.status = status;
    await borrow.save();

    return res.status(200).json({ message: "Status updated successfully", borrow });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ message: "Could not update status", error: e.message });
  }
}


async function returnBook(req, res) {
  const borrowId = req.params.borrowId;
  const { returnDate } = req.body;
  try {
    const borrow = await Borrow.findById(borrowId).populate("book");
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    if (borrow.actualReturnDate) {
      return res.status(400).json({ message: "Book already returned" });
    }
    borrow.actualReturnDate = returnDate || new Date().toISOString();
    await borrow.save();

    const book = await Book.findById(borrow.book._id);
    if (book) {
      book.number += 1;
      await book.save();
    }

    return res.status(200).json({ actualReturnDate: borrow.actualReturnDate });
  } catch (e) {
    console.error("Error returning book:", e);
    return res
      .status(500)
      .json({ message: "Could not return book", error: e.message });
  }
}

async function getAllBorrow(req, res) {
  try {
    const borrows = await Borrow.find()
      .populate({
        path: "user",
        select: "username email address",
      })
      .populate({
        path: "book",
        select: "name cover author number",
        populate: {
          path: "author",
          select: "name"
        }
      })
      .exec();
    return res.status(200).json(borrows);
  } catch (e) {
    console.error("Error retrieving borrow:", e);
    return res
      .status(500)
      .json({ message: "Could not retrieve borrow", error: e.message });
  }
}

async function getUserBorrow(req, res) {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "invalid" });
  }
  try {
    const borrowUser = await Borrow.find({ user: userId })
      .populate("book", "name")
      .exec();
    if (!borrowUser) {
      return res.status(405).json({ message: "borrowUser not found" });
    } else {
      return res.status(200).json(borrowUser);
    }
  } catch (e) {
    console.error("Error retrieving borrowUser:", e);
    return res
      .status(500)
      .json({ message: "Could not retrieve borrowUser", error: e.message });
  }
}

module.exports = {
  create,
  getAllBorrow,
  returnBook,
  getUserBorrow,
  updateStatus,
};
