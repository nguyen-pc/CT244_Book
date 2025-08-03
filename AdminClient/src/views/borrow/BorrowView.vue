<template>
  <div class="container py-4 mt-10">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary mb-3 mb-md-0">
        📚 Quản lý Mượn Sách
      </h2>
      <div class="d-flex w-100 w-md-auto gap-3">
        <div class="input-group">
          <input type="text" class="form-control shadow-sm" placeholder="Tìm theo tên khách hoặc sách..."
            v-model="query" aria-label="Tìm kiếm" />
          <span class="input-group-text bg-primary text-white border-primary">
            <font-awesome-icon :icon="faSearch" />
          </span>
        </div>
        <select class="form-select w-auto shadow-sm" v-model="selectedStatus">
          <option value="">Tất cả</option>
          <option value="pending">Đang xử lý</option>
          <option value="approved">Đã duyệt</option>
          <option value="borrowing">Đang mượn</option>
          <option value="returned">Đã trả</option>
          <option value="overdue">Quá hạn</option>
          <option value="rejected">Từ chối</option>
          <option value="eliminated">Đã kết thúc</option>
        </select>
      </div>
    </div>

    <div class="card shadow-lg border-0">
      <div class="card-body p-0">
        <div v-if="!paginatedData.length" class="p-5 text-center text-muted">
          <p class="lead mb-0">Không có yêu cầu mượn sách nào.</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th scope="col" class="text-center">Khách hàng</th>
                <th scope="col" class="text-center">Sách</th>
                <th scope="col" class="text-center d-none d-md-table-cell">Thời gian</th>
                <th scope="col" class="text-center">Trạng thái</th>
                <th scope="col" class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedData" :key="item._id">
                <td>
                  <div class="d-flex flex-column justify-content-center">
                    <div class="fw-semibold text-dark">{{ item.user.username }}</div>
                    <small class="text-muted d-none d-md-block mt-1">{{ item.user.email || "Không có email" }}</small>
                  </div>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-2">
                    <img :src="`http://localhost:3500/uploads/${item.book.cover}`" class="rounded shadow-sm border"
                      alt="Bìa sách" style="width: 40px; height: 60px; object-fit: cover" />
                    <div class="d-flex flex-column">
                      <div class="fw-semibold text-dark text-truncate" style="max-width: 150px;">{{ item.book.name }}
                      </div>
                      <small class="text-muted d-none d-lg-block">Tác giả: <span class="text-dark">{{
                        item.book.author.name
                          }}</span></small>
                    </div>
                  </div>
                </td>

                <td class="text-center text-muted d-none d-md-table-cell">
                  <div v-if="item.status === 'pending'">
                    <small>Yêu cầu:</small>
                    <div class="fw-medium">{{ formatDate(item.requestDate) }}</div>
                    <small>Số ngày:</small>
                    <div class="fw-medium text-danger">{{ item.borrowedDays }}</div>
                  </div>
                  <div
                    v-else-if="item.status === 'approved' || item.status === 'borrowing' || item.status === 'overdue'">
                    <small>Đã duyệt:</small>
                    <div class="fw-medium">{{ formatDate(item.approvedDate) }}</div>
                  </div>
                  <div v-else-if="item.status === 'returned' || item.status === 'eliminated'">
                    <small>Hoàn thành:</small>
                    <div class="fw-medium">{{ formatDate(item.actualReturnDate) }}</div>
                  </div>
                  <div v-else-if="item.status === 'rejected'">
                    <small>Đã từ chối:</small>
                    <div class="fw-medium">{{ formatDate(item.rejectedDate) }}</div>
                  </div>
                  <div v-else>
                    <small>N/A</small>
                  </div>
                </td>

                <td class="text-center">
                  <span class="badge py-2 px-3 fw-bold w-100" :class="statusColor(item.status)"
                    v-html="getStatus(item.status)"></span>
                </td>

                <td class="text-center">
                  <div v-if="updateBorrowId !== item._id" class="d-flex flex-column gap-2 justify-content-center">
                    <div v-if="item.status === 'pending'" class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-danger btn-sm fw-bold" @click="setUpdateBorrow(item._id, 'rejected')"
                        title="Từ chối yêu cầu">
                        <i class="fa-solid fa-xmark"></i> <span class="d-none d-lg-inline">Từ chối</span>
                      </button>
                      <button class="btn btn-success btn-sm fw-bold" @click="setUpdateBorrow(item._id, 'approved')"
                        title="Duyệt yêu cầu">
                        <i class="fa-solid fa-check"></i> <span class="d-none d-lg-inline">Đồng ý</span>
                      </button>
                    </div>

                    <div v-else-if="item.status === 'approved'">
                      <button class="btn btn-primary btn-sm fw-bold w-100"
                        @click="setUpdateBorrow(item._id, 'borrowing')" title="Xác nhận cho mượn sách">
                        <i class="fa-solid fa-book-open-reader me-1"></i> <span class="d-none d-lg-inline">Mượn
                          sách</span>
                      </button>
                    </div>

                    <div v-else-if="item.status === 'borrowing' || item.status === 'overdue'">
                      <button class="btn btn-success btn-sm text-white fw-bold w-100"
                        @click="setUpdateBorrow(item._id, 'returned')" title="Xác nhận trả sách">
                        <i class="fa-solid fa-book me-1"></i> <span class="d-none d-lg-inline">Trả sách</span>
                      </button>
                    </div>

                    <div v-else-if="
                      item.status === 'eliminated' ||
                      item.status === 'returned' ||
                      item.status === 'rejected'
                    " class="d-flex justify-content-center">
                      <button class="btn btn-outline-secondary btn-sm fw-bold w-100" disabled>
                        <i class="fa-solid fa-check-double me-1"></i> <span class="d-none d-lg-inline">Hoàn thành</span>
                      </button>
                    </div>
                  </div>
                  <div v-else class="d-flex flex-column align-items-center">
                    <p class="text-danger small mb-2 fw-bold">Lưu thay đổi?</p>
                    <div class="d-flex gap-2">
                      <button class="btn btn-success btn-sm" @click="updateBorrow">
                        <i class="fa-solid fa-check"></i>
                      </button>
                      <button class="btn btn-secondary btn-sm" @click="removeUpdateBorrow">
                        <i class="fa-solid fa-xmark"></i>
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

    <nav v-if="totalPages > 1" aria-label="Page navigation" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
          <a class="page-link" @click.prevent="goToPage(currentPage - 1)">Trước</a>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ 'active': currentPage === page }">
          <a class="page-link" @click.prevent="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
          <a class="page-link" @click.prevent="goToPage(currentPage + 1)">Sau</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useBorrowStore } from "../../stores/borrow";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faSearch,
  faHourglassHalf,
  faCircleCheck,
  faCircleXmark,
  faBookOpenReader,
  faArrowLeftLong,
  faClock,
  faBan,
  faCircleQuestion,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";

// Register icons
const faSearchIcon = faSearch;

const borrowStore = useBorrowStore();
const query = ref("");
const selectedStatus = ref("");

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 5;

const fetchBorrow = async () => {
  try {
    await borrowStore.getAllBorrows();
  } catch (error) {
    console.error("Error fetching borrows:", error);
  }
};

onMounted(fetchBorrow);

// Lắng nghe thay đổi của query và selectedStatus để reset về trang 1
watch([query, selectedStatus], () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  let filteredBorrow = borrowStore.allBorrow;
  const searchQuery = query.value.toLowerCase();
  const status = selectedStatus.value;

  if (searchQuery) {
    filteredBorrow = filteredBorrow.filter((item: any) => {
      const bookName = item.book?.name?.toLowerCase() || "";
      const username = item.user?.username?.toLowerCase() || "";
      return bookName.includes(searchQuery) || username.includes(searchQuery);
    });
  }
  if (status) {
    filteredBorrow = filteredBorrow.filter((item: any) => item.status === status)
  }
  return filteredBorrow;
});

// Logic phân trang
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage));
const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredData.value.slice(startIndex, endIndex);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};


const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function getStatus(status: string): string {
  switch (status) {
    case "pending":
      return `<i class="fa-solid fa-hourglass-half me-1"></i> Đang xử lý`;
    case "approved":
      return `<i class="fa-solid fa-circle-check me-1"></i> Đã duyệt`;
    case "rejected":
      return `<i class="fa-solid fa-circle-xmark me-1"></i> Từ chối`;
    case "borrowing":
      return `<i class="fa-solid fa-book-open-reader me-1"></i> Đang mượn`;
    case "returned":
      return `<i class="fa-solid fa-arrow-left-long me-1"></i> Đã trả`;
    case "overdue":
      return `<i class="fa-solid fa-clock me-1"></i> Quá hạn`;
    case "eliminated":
      return `<i class="fa-solid fa-ban me-1"></i> Đã kết thúc`;
    default:
      return `<i class="fa-solid fa-circle-question me-1"></i> Chưa xác định`;
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-warning text-dark';
    case 'approved':
    case 'borrowing':
      return 'bg-info';
    case 'returned':
    case 'eliminated':
      return 'bg-success';
    case 'rejected':
    case 'overdue':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};


const updateBorrowId = ref("");
const updateStatus = ref("");

function setUpdateBorrow(id: string, status: string) {
  updateBorrowId.value = id;
  updateStatus.value = status;
}

function removeUpdateBorrow() {
  updateBorrowId.value = "";
  updateStatus.value = "";
}

async function updateBorrow() {
  try {
    await borrowStore.updateBorrow(updateBorrowId.value, updateStatus.value);
    await fetchBorrow();
    updateBorrowId.value = "";
    updateStatus.value = "";
  } catch (error) {
    console.error("Error updating borrow status:", error);
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #343a40;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table td,
.table th {
  padding: 1rem;
}

.badge {
  min-width: 100px;
  padding: 0.5em 0.8em;
  font-size: 0.875rem;
  line-height: 1.2;
}

.btn-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

img {
  transition: transform 0.2s ease-in-out;
}

img:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {

  .table thead th:nth-child(3),
  .table tbody td:nth-child(3) {
    display: none;
  }
}

@media (max-width: 992px) {
  .d-md-block {
    display: none !important;
  }
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>