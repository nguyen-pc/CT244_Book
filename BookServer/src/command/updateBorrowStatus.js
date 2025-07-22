const Borrow = require("../models/Borrow");

async function updateBorrowStatus() {
    const now = new Date();

    // Tìm tất cả bản ghi có status đang là 'borrowing' hoặc 'approved'
    const borrows = await Borrow.find({
        status: { $in: ["borrowing", "approved"] },
    });

    for (const borrow of borrows) {
        // Nếu đang mượn và quá hạn -> chuyển thành 'overdue'
        if (
            borrow.status === "borrowing" &&
            borrow.estimatedReturnDate &&
            borrow.estimatedReturnDate < now
        ) {
            borrow.status = "overdue";
            await borrow.save();
        }

        // Nếu đã approved quá 3 ngày mà chưa mượn -> chuyển thành 'eliminated'
        if (borrow.status === "approved" && borrow.approvedDate) {
            const expired = new Date(borrow.approvedDate);
            expired.setDate(expired.getDate() + 3);

            if (now > expired) {
                borrow.status = "eliminated";
                await borrow.save();
            }
        }
    }

    console.log("Borrow statuses updated.");
}

module.exports = updateBorrowStatus;
