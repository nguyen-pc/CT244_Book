const mongoose = require("mongoose");
const connectDB = require("../config/database");
const Borrow = require("../models/Borrow");

async function deleteAllBorrowings() {
    try {
        await connectDB();
        await Borrow.deleteMany({});
        console.log("All borrowings deleted successfully.");
        process.exit();
    } catch (e) {
        console.error("Cannot delete borrowings:", e);
    }
}

deleteAllBorrowings();
