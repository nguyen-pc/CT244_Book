<template>
  <div class="container py-4 mt-10">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary mb-0">
        📚 Quản lý Mượn Sách
      </h2>
      <div class="input-group w-50">
        <input type="text" class="form-control shadow-sm" placeholder="Tìm theo tên khách hoặc sách..." v-model="query"
          aria-label="Tìm kiếm" />
        <span class="input-group-text bg-primary text-white border-primary">
          <font-awesome-icon :icon="faSearch" />
        </span>
      </div>
    </div>

    <div class="d-flex justify-content-end mb-4">
      <select class="form-select w-auto shadow-sm" v-model="selectedStatus">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Đang xử lý</option>
        <option value="approved">Đã duyệt</option>
        <option value="borrowing">Đang mượn</option>
        <option value="returned">Đã trả</option>
        <option value="overdue">Quá hạn</option>
        <option value="rejected">Từ chối</option>
        <option value="eliminated">Đã kết thúc</option>
      </select>
    </div>

    <div class="card shadow-lg border-0">
      <div class="card-body p-0">
        <div v-if="!filteredData.length" class="p-5 text-center text-muted">
          <p class="lead mb-0">Không có yêu cầu mượn sách nào.</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th scope="col" class="text-center" style="width: 25%">Khách hàng</th>
                <th scope="col" class="text-center" style="width: 40%">Sách</th>
                <th scope="col" class="text-center" style="width: 10%">Thời gian</th>
                <th scope="col" class="text-center" style="width: 10%">Trạng thái</th>
                <th scope="col" class="text-center" style="width: 15%">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredData" :key="item._id">
                <td>
                  <div class="d-flex flex-column justify-content-center">
                    <div class="fw-semibold text-primary">
                      {{ item.user.username }}
                    </div>
                    <small class="text-muted mt-1">
                      <div>📧 {{ item.user.email || "Không có email" }}</div>
                      <div>🏠 {{ item.user.address || "Không có địa chỉ" }}</div>
                    </small>
                  </div>
                </td>

                <td>
                  <div class="d-flex align-items-center gap-3">
                    <img :src="`http://localhost:3500/uploads/${item.book.cover}`" class="rounded shadow-sm border"
                      alt="Bìa sách" style="width: 60px; height: 90px; object-fit: cover" />
                    <div>
                      <div class="fw-semibold text-dark">{{ item.book.name }}</div>
                      <small class="text-muted mt-1">
                        <div>Tác giả: <span class="text-dark">{{ item.book.author.name }}</span></div>
                        <div>Số lượng: <span class="text-dark">{{ item.book.number }}</span></div>
                      </small>
                    </div>
                  </div>
                </td>

                <td class="text-center text-muted">
                  <div v-if="item.status === 'pending'">
                    <small>Yêu cầu:</small>
                    <div class="fw-medium">{{ formatDate(item.requestDate) }}</div>
                    <small>Số ngày:</small>
                    <div class="fw-medium text-danger">{{ item.borrowedDays }}</div>
                  </div>
                  <div v-else-if="item.status === 'approved'">
                    <small>Đã duyệt:</small>
                    <div class="fw-medium">{{ formatDate(item.approvedDate) }}</div>
                  </div>
                  <div v-else-if="item.status === 'rejected'">
                    <small>Đã duyệt:</small>
                    <div class="fw-medium">{{ formatDate(item.rejectedDate) }}</div>
                  </div>
                  <div v-else-if="item.status === 'borrowing' || item.status === 'overdue'">
                    <small>Đã mượn:</small>
                    <div class="fw-medium">{{ formatDate(item.borrowedDate) }}</div>
                    <small>Trả dự kiến:</small>
                    <div class="fw-medium">{{ formatDate(item.estimatedReturnDate) }}</div>
                  </div>
                  <div v-else-if="item.status === 'returned' || item.status === 'eliminated'">
                    <small>Hoàn thành:</small>
                    <div class="fw-medium">{{ formatDate(item.actualReturnDate) }}</div>
                  </div>
                  <div v-else>
                    <small>N/A</small>
                  </div>
                </td>

                <td class="text-center">
                  <span class="badge py-2 px-3 fw-normal" :class="{
                    'bg-warning text-dark': item.status === 'pending',
                    'bg-success': item.status === 'approved',
                    'bg-danger': item.status === 'rejected' || item.status === 'overdue',
                    'bg-primary': item.status === 'borrowing',
                    'bg-secondary': item.status === 'returned',
                    'bg-dark': item.status === 'eliminated',
                  }" v-html="getStatus(item.status)"></span>
                </td>

                <td class="text-center">
                  <div v-if="updateBorrowId !== item._id">
                    <div v-if="item.status === 'pending'" class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-danger btn-sm" @click="setUpdateBorrow(item._id, 'rejected')"
                        title="Từ chối yêu cầu">
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                      <button class="btn btn-success btn-sm" @click="setUpdateBorrow(item._id, 'approved')"
                        title="Duyệt yêu cầu">
                        <i class="fa-solid fa-check"></i>
                      </button>
                    </div>

                    <div v-else-if="item.status === 'approved'" class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-primary btn-sm" @click="setUpdateBorrow(item._id, 'borrowing')"
                        title="Xác nhận mượn sách">
                        <i class="fa-solid fa-book-open-reader"></i> Xác nhận mượn
                      </button>
                    </div>

                    <div v-else-if="item.status === 'borrowing' || item.status === 'overdue'"
                      class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-info btn-sm text-white" @click="setUpdateBorrow(item._id, 'returned')"
                        title="Xác nhận trả sách">
                        <i class="fa-solid fa-book-return"></i> Xác nhận trả
                      </button>
                    </div>

                    <div v-else-if="
                      item.status === 'eliminated' ||
                      item.status === 'returned' ||
                      item.status === 'rejected'
                    " class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-outline-secondary btn-sm" disabled>
                        <i class="fa-solid fa-check-double"></i> Đã kết thúc
                      </button>
                    </div>
                  </div>
                  <div v-else class="d-flex flex-column align-items-center">
                    <p class="text-danger small mb-2">Lưu thay đổi?</p>
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
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
const faHourglassHalfIcon = faHourglassHalf;
const faCircleCheckIcon = faCircleCheck;
const faCircleXmarkIcon = faCircleXmark;
const faBookOpenReaderIcon = faBookOpenReader;
const faArrowLeftLongIcon = faArrowLeftLong;
const faClockIcon = faClock;
const faBanIcon = faBan;
const faCircleQuestionIcon = faCircleQuestion;
const faCheckDoubleIcon = faCheckDouble;

const borrowStore = useBorrowStore();
const query = ref("");
const selectedStatus = ref("");

const fetchBorrow = async () => {
  try {
    await borrowStore.getAllBorrows();
  } catch (error) {
    console.error("Error fetching borrows:", error);
  }
};

onMounted(fetchBorrow);

const filteredData = computed(() => {
  let filteredBorrow = borrowStore.allBorrow;
  const searchQuery = query.value.toLowerCase();
  const status = selectedStatus.value;
  if (query) {
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
      return `<i class="fa-solid fa-circle-xmark me-1"></i> Đã từ chối`;
    case "borrowing":
      return `<i class="fa-solid fa-book-open-reader me-1"></i> Đang mượn`;
    case "returned":
      return `<i class="fa-solid fa-arrow-left-long me-1"></i> Đã trả sách`;
    case "overdue":
      return `<i class="fa-solid fa-clock me-1"></i> Quá hạn trả`;
    case "eliminated":
      return `<i class="fa-solid fa-ban me-1"></i> Đã kết thúc`;
    default:
      return `<i class="fa-solid fa-circle-question me-1"></i> Chưa xác định`;
  }
}

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
    await fetchBorrow(); // Re-fetch data after successful update
    updateBorrowId.value = "";
    updateStatus.value = "";
  } catch (error) {
    console.error("Error updating borrow status:", error);
    // You might want to show an error message to the user here
  }
}
</script>

<style scoped>
/* No additional scoped styles are strictly necessary with comprehensive Bootstrap usage,
   but you can add them for highly specific overrides or custom components. */
.container {
  max-width: 1200px;
  /* Adjust as needed */
}

.table thead th {
  background-color: #f8f9fa;
  /* Lighter header background */
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
  /* Ensures badges have a consistent width */
  padding: 0.5em 0.8em;
  /* Adjust padding for better look */
  font-size: 0.875rem;
  /* Slightly larger font size for readability */
}

.btn-sm {
  font-size: 0.875rem;
  /* Consistent smaller font for action buttons */
  padding: 0.375rem 0.75rem;
}

img {
  transition: transform 0.2s ease-in-out;
}

img:hover {
  transform: scale(1.05);
  /* Subtle zoom effect on hover */
}
</style>