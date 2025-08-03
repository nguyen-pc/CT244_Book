<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="text-success fw-bold m-0">Lịch sử mượn sách</h3>
      <input type="text" v-model="query" placeholder="Tìm kiếm..." class="form-control me-2 d-none d-md-block"
        style="max-width: 300px;" />
    </div>

    <div v-if="filteredData.length">
      <!-- Desktop Table View -->
      <div class="table-responsive d-none d-md-block">
        <table class="table table-bordered table-hover shadow-sm">
          <thead class="table-light">
            <tr>
              <th v-for="column in columns" :key="column.key" class="text-nowrap">
                {{ column.title }}
              </th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in filteredData" :key="row._id">
              <td v-for="column in columns" :key="column.key" v-html="renderDesktopCell(row, column)"></td>
              <td class="text-center p-2">
                <button v-if="row.status === 'pending' || row.status === 'approved'" class="btn btn-sm btn-danger"
                  @click="handleCancel(row)">
                  <i class="bi bi-x-circle me-1"></i> Hủy
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List View -->
      <div class="d-block d-md-none">
        <div v-for="row in filteredData" :key="row._id" class="mobile-card mb-3">
          <div class="mobile-item" v-for="column in columns" :key="column.key">
            <div v-html="renderMobileCell(row, column)"></div>
          </div>
          <div class="mobile-actions text-end mt-3 pt-2 border-top">
            <button v-if="row.status === 'pending' || row.status === 'approved'" class="btn btn-sm btn-danger"
              @click="handleCancel(row)">
              <i class="bi bi-x-circle me-1"></i> Hủy
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <div v-if="!borrowStore.isLoading" class="alert alert-info">
        Không có lịch sử mượn sách nào.
      </div>
      <div v-else>
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Đang tải lịch sử mượn sách...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useBorrowStore } from "@/stores/borrow";
import { useAuthStore } from "@/stores/auth";
import { toast, type ToastOptions } from 'vue3-toastify';

const borrowStore = useBorrowStore();
const authStore = useAuthStore();
const query = ref("");

const columns = [
  { title: "Tên sách", dataIndex: "book", key: "book" },
  { title: "Ngày yêu cầu", dataIndex: "requestDate", key: "requestDate" },
  { title: "Ngày duyệt", dataIndex: "approvedDate", key: "approvedDate" },
  { title: "Hạn trả", dataIndex: "estimatedReturnDate", key: "estimatedReturnDate" },
  { title: "Ngày đã trả", dataIndex: "actualReturnDate", key: "actualReturnDate" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const statusLabel: { [key: string]: string } = {
  borrowed: "Đang mượn",
  returned: "Đã trả",
  rejected: "Từ chối",
  approved: "Đã duyệt",
  pending: "Chờ duyệt",
  overdue: "Trễ hạn",
  eliminated: "Loại bỏ",
};

const fetchAllData = async () => {
  try {
    await Promise.all([
      authStore.getUser(),
      borrowStore.getUserBorrow(authStore.user?.id)
    ]);
  } catch (e) {
    console.error("Error fetching data:", e);
  }
};

onMounted(() => {
  fetchAllData();
});

const filteredData = computed(() => {
  const allBorrows = borrowStore.allBorrows;
  if (!allBorrows || !Array.isArray(allBorrows)) {
    return [];
  }

  const reversedData = [...allBorrows].reverse();

  if (!query.value) {
    return reversedData;
  }

  const searchTerm = query.value.toLowerCase();

  return reversedData.filter((item: any) => {
    const bookName = item.book?.name?.toLowerCase() || '';
    if (bookName.includes(searchTerm)) {
      return true;
    }

    const statusText = statusLabel[item.status]?.toLowerCase() || '';
    if (statusText.includes(searchTerm)) {
      return true;
    }

    const requestDate = formatDate(item.requestDate);
    if (requestDate.includes(searchTerm)) {
      return true;
    }

    return false;
  });
});

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getCellValue = (row: any, column: any) => {
  const keys = column.dataIndex.split(".");
  let value = row;

  try {
    for (const key of keys) {
      value = value?.[key];
    }

    if (["approvedDate", "estimatedReturnDate", "actualReturnDate", "requestDate"].includes(column.key)) {
      return formatDate(value);
    }

    return value !== undefined && value !== null ? value : "";
  } catch (err) {
    console.error("Get cell value error:", err);
    return "";
  }
};

const renderDesktopCell = (row: any, column: any) => {
  try {
    if (column.key === 'book') {
      const bookName = row.book?.name || 'N/A';
      const bookCover = row.book?.cover || 'default-cover.jpg';
      const imageUrl = `http://localhost:3500/uploads/${bookCover}`;

      return `
        <div class="d-flex align-items-center">
          <img src="${imageUrl}" alt="${bookName}" style="width: 42px" class="book-cover-table me-2" />
          <span>${bookName}</span>
        </div>
      `;
    }

    if (column.key === "status") {
      const status = getCellValue(row, column);
      return `<span class="badge ${statusColor(status)}">${statusLabel[status] || status}</span>`;
    }

    return getCellValue(row, column);
  } catch (err) {
    console.error("Render desktop cell error:", err);
    return "";
  }
};

const renderMobileCell = (row: any, column: any) => {
  try {
    let cellValue = '';

    if (column.key === 'book') {
      const bookName = row.book?.name || 'N/A';
      const bookCover = row.book?.cover || 'default-cover.jpg';
      const imageUrl = `http://localhost:3500/uploads/${bookCover}`;

      cellValue = `
        <div class="d-flex align-items-start flex-column justify-content-center text-center">
          <span class="ms-auto fw-bold">${bookName}</span>
          <img src="${imageUrl}" alt="${bookName}" style="width: 80px;" class="ms-auto book-cover-mobile" />
        </div>
      `;
    } else if (column.key === "status") {
      const status = getCellValue(row, column);
      cellValue = `<span class="badge ${statusColor(status)}">${statusLabel[status] || status}</span>`;
    } else {
      cellValue = getCellValue(row, column) || '<span class="text-muted">--</span>';
    }

    return `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="fw-bold text-muted" style="min-width: 100px;">${column.title}:</span>
        <div class="text-end flex-grow-1 ms-2">${cellValue}</div>
      </div>
    `;
  } catch (err) {
    console.error("Render mobile cell error:", err);
    return "";
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-primary";
    case "approved":
    case "borrowed":
      return "bg-success";
    case "returned":
      return "bg-info";
    case "overdue":
    case "eliminated":
    case "rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const handleCancel = async (row: any) => {
  const confirmed = confirm(`Bạn có chắc chắn muốn hủy yêu cầu mượn sách "${row.book.name}"?`);
  if (confirmed) {
    try {
      console.log(row._id);
      await borrowStore.updateBorrow(row._id, 'eliminated');
      toast.success("Hủy yêu cầu thành công!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);

      await fetchAllData();
    } catch (error) {
      console.error("Error canceling borrow request:", error);
      toast.error("Không thể hủy yêu cầu!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    }
  }
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.book-cover-table {
  width: 32px !important;
  height: 48px !important;
  object-fit: cover;
  border-radius: 4px;
}

.book-cover-mobile {
  width: 24px !important;
  height: 36px !important;
  object-fit: cover;
  border-radius: 3px;
}

.book-cover-table {
  width: 32px !important;
  height: 48px !important;
  object-fit: cover;
  border-radius: 4px;
}

.book-cover-mobile {
  width: 40px !important;
  height: 60px !important;
  object-fit: cover;
  border-radius: 4px;
}

/* Mobile List Styles */
@media (max-width: 767px) {
  .mobile-card {
    border: 1px solid #dee2e6;
    border-radius: 0.75rem;
    padding: 1rem;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
  }

  .mobile-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .mobile-item {
    margin-bottom: 0.5rem;
  }

  .mobile-item:last-child {
    margin-bottom: 0;
  }

  .mobile-actions {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e9ecef !important;
  }

  /* Search input on mobile */
  .form-control.d-none.d-md-block {
    display: block !important;
    margin-top: 0.5rem;
    max-width: 100% !important;
  }

  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    align-items: stretch !important;
  }

  .text-success.fw-bold.m-0 {
    text-align: center;
    margin-bottom: 0.5rem !important;
  }
}

/* Desktop Styles */
@media (min-width: 768px) {
  .table thead th {
    background-color: #f8f9fa;
    font-weight: 600;
    padding: 0.75rem;
  }

  .table tbody td {
    padding: 0.75rem;
    vertical-align: middle;
  }

  .table-hover tbody tr:hover {
    background-color: rgba(0, 0, 0, .025);
  }
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075) !important;
}

/* Responsive container */
@media (max-width: 576px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>