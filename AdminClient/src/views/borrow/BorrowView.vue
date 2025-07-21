<template>
  <div class="container mt-5 ms-3">
    <div class="mb-4">
      <h2 class="fw-bold">📚 Quản lý mượn sách</h2>
    </div>

    <!-- Tìm kiếm -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="input-group w-50">
        <input type="text" class="form-control" placeholder="Tìm theo tên khách hoặc sách" v-model="query" />
        <span class="input-group-text bg-primary text-white">
          <font-awesome-icon :icon="faSearch" />
        </span>
      </div>
    </div>

    <!-- Danh sách -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="!filteredData.length" class="p-3 text-center text-muted">Không có người mượn nào.</div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead class="table-light text-center">
              <tr>
                <th style="width: 25%;">Khách hàng</th>
                <th style="width: 40%;">Sách</th>
                <th style="width: 10%;">Thời gian</th>
                <th style="width: 10%;">Trạng thái</th>
                <th style="width: 15%;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredData" :key="item._id">
                <!-- Khách hàng -->
                <td>
                  <div class="cursor-pointer">
                    <div class="fw-semibold text-primary">{{ item.user.username }}</div>
                    <div class="mt-2 small text-muted">
                      <div>📧 {{ item.user.email || "Không có email" }}</div>
                      <div>🏠 {{ item.user.address || "Không có địa chỉ" }}</div>
                    </div>
                  </div>
                </td>

                <!-- Thông tin sách -->
                <td>
                  <div class="d-flex align-items-start gap-3" style="cursor: pointer;">
                    <img :src="`http://localhost:3500/uploads/${item.book.cover}`" class="rounded shadow-sm"
                      style="width: 70px; height: 100px; object-fit: cover;" />
                    <div>
                      <div class="fw-semibold">{{ item.book.name }}</div>
                      <div class="text-muted mt-2 small">
                        <div>Tác giả: <span class="text-dark">{{ item.book.author.name }}</span></div>
                        <div>Số lượng: <span class="text-dark">{{ item.book.number }}</span></div>
                      </div>
                    </div>
                  </div>
                </td>
                <!-- Mốc thời gian -->
                <td class="text-center">
                  <div v-if="item.status === 'pending'">Ngày yêu cầu: {{ formatDate(item.requestDay) }}</div>
                </td>
                <!-- Trạng thái -->
                <td class="text-center">
                  <div class="m-0 p-2" style="font-size: 14px;" :class="{
                    'badge bg-primary': item.status === 'pending',
                    'badge bg-success': item.status === 'borrowing',
                    'badge bg-secondary': item.status === 'returned',
                    'badge bg-danger': item.status === 'overdue'
                  }" v-html="getStatus(item.status)">
                  </div>
                </td>

                <!-- Hành động -->
                <td class="text-center">
                  <div v-if="updateBorrowId !== item._id" class="d-flex justify-content-around">
                    <button class="btn btn-sm btn-outline-danger" @click="setUpdateBorrow(item._id, 'rejected')">
                      <i class="fa-solid fa-x me-1"></i> Từ chối
                    </button>
                    <button class="btn btn-sm btn-outline-success" @click="setUpdateBorrow(item._id, 'approved')">
                      <i class="fa-solid fa-check me-1"></i> Duyệt
                    </button>
                  </div>
                  <div v-else>
                    <p class="text-danger small mb-2">Xác nhận lưu thay đổi?</p>
                    <div class="d-flex justify-content-around">
                      <button class="btn btn-sm btn-success" @click="editBorrowing(item)">
                        <i class="fa-solid fa-check me-1"></i> Xác nhận
                      </button>
                      <button class="btn btn-sm btn-secondary" @click="removeUpdateBorrow">
                        <i class="fa-solid fa-x me-1"></i> Hủy
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";

const collapsedIndexes = ref(new Set());

function toggleCollapse(index) {
  if (collapsedIndexes.value.has(index)) {
    collapsedIndexes.value.delete(index);
  } else {
    collapsedIndexes.value.add(index);
  }
}

function isCollapsed(index) {
  return collapsedIndexes.value.has(index);
}

const borrowStore = useBorrowStore();
const query = ref("");

const fetchBorrow = async () => {
  try {
    await borrowStore.getAllBorrows();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

onMounted(fetchBorrow);

const filteredData = computed(() => {
  if (!query.value) {
    return borrowStore.allBorrow;
  }
  const searchQuery = query.value.toLowerCase();
  return borrowStore.allBorrow.filter((item: any) => {
    // Access the nested properties safely
    const bookName = item.book?.name?.toLowerCase() || "";
    const username = item.user?.username?.toLowerCase() || "";

    // Check if either the book name or the username matches the search query
    return bookName.includes(searchQuery) || username.includes(searchQuery);
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

function getStatus(status: string): string {
  switch (status) {
    case "pending": return `<i class="fa-solid fa-hourglass-half me-2"></i> Đang xử lý`;
    case "approved":
      return `<i class="fa-solid fa-check-circle text-success"></i> Đã duyệt`;
    case "rejected":
      return `<i class="fa-solid fa-times-circle text-danger"></i> Đã từ chối`;
    default:
      return `<i class="fa-solid fa-question-circle text-secondary"></i> Chưa xác định`;
  }
}

const updateBorrowId = ref("");
const updateStatus = ref("")
function setUpdateBorrow(id: string, status: string) {
  updateBorrowId.value = id;
  updateStatus.value = status;
}
function removeUpdateBorrow() {
  updateBorrowId.value = "";
}

</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
}

.hover-text-danger:hover {
  color: #dc3545;
  text-decoration: underline;
}
</style>
