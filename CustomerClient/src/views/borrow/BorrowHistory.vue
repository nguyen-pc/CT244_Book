<template>
  <div class="container mt-5">
    <h3 class="mb-4 text-success fw-bold">Lịch sử mượn sách</h3>
    <input type="text" v-model="query" placeholder="Tìm kiếm..." class="form-control mb-3" />
    <template v-if="!filteredData.length">
      <div class="alert alert-info">Không có mượn quyển sách nào</div>
    </template>
    <template v-else>

      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th v-for="column in columns" :key="column.key">
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredData" :key="row._id">
              <td v-for="column in columns" :key="column.key" v-html="renderCell(row, column)"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useBorrowStore } from "@/stores/borrow";
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from "@/stores/book";

const route = useRoute();
const borrowStore = useBorrowStore();
const authStore = useAuthStore();
const bookStore = useBookStore();

const query = ref("");

const columns = [
  { title: "Tên sách", dataIndex: "book.name", key: "book" },
  { title: "Ngày yêu cầu", dataIndex: "requestDate", key: "requestDate" },
  { title: "Ngày duyệt", dataIndex: "approvedDate", key: "approvedDate" },
  { title: "Hạn trả", dataIndex: "estimatedReturnDate", key: "estimatedReturnDate" },
  { title: "Ngày đã trả", dataIndex: "actualReturnDate", key: "actualReturnDate" },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const statusLabel = {
  borrowed: "Đang mượn",
  returned: "Đã trả",
  rejected: "Từ chối",
  approved: "Đã duyệt",
  pending: "Chờ duyệt",
  overdue: "Trễ hạn",
  eliminated: "Loại bỏ",
};

const fetchUser = async () => {
  try {
    await authStore.getUser();
  } catch (e) {
    console.error("Error fetching user:", e);
  }
};

const fetchBorrow = async () => {
  try {
    if (authStore.user?.id) {
      await borrowStore.getUserBorrow(authStore.user.id);
    }
  } catch (error) {
    console.error("Error fetching borrow list:", error);
  }
};

onMounted(async () => {
  await fetchUser();
  await fetchBorrow();
});

const filteredData = computed(() => {
  if (!query.value) return borrowStore.allBorrows.reverse();

  return borrowStore.allBorrows.filter((item: any) => {
    const allText = JSON.stringify(item).toLowerCase();
    return allText.includes(query.value.toLowerCase());
  }).reverse();
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

const renderCell = (row: any, column: any) => {
  const keys = column.dataIndex.split(".");
  let value = row;

  try {
    for (const key of keys) {
      value = value?.[key];
    }

    if (["approvedDate", "estimatedReturnDate", "actualReturnDate", "requestDate"].includes(column.key)) {
      return formatDate(value);
    }

    if (column.key === "status") {
      return `<span class="badge ${statusColor(value)}">${statusLabel[value] || value}</span>`;
    }

    return value !== undefined && value !== null ? value : "";
  } catch (err) {
    console.error("Render error:", err);
    return "";
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "borrowed":
      return "bg-warning text-dark";
    case "returned":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    case "approved":
      return "bg-info text-dark";
    case "pending":
      return "bg-secondary";
    case "overdue":
      return "bg-danger text-white";
    case "eliminated":
      return "bg-dark text-white";
    default:
      return "bg-light";
  }
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
