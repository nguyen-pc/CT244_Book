<template>
  <div class="container py-5">
    <div v-if="book" class="row gx-lg-5">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <div class="d-flex flex-column flex-md-row align-items-center">
          <img :src="`http://localhost:3500/uploads/${book.cover}`" alt="Book Cover"
            class="book-cover mb-4 mb-md-0 me-md-4" />
          <div class="card p-4 w-100 h-100 border-0 shadow-sm">
            <h3 class="card-title text-success fw-bold mb-3">{{ book.name }}</h3>

            <p class="mb-2">
              <span class="text-muted fw-bold">Tác giả: </span>
              <span class="fw-semibold">{{ book.author.name }}</span>
            </p>

            <p class="mb-2">
              <span class="text-muted fw-bold">Nhà xuất bản: </span>
              <span class="fw-semibold">{{ book.publisher.name }}</span>
            </p>

            <p class="mb-2">
              <span class="text-muted fw-bold">Năm xuất bản: </span>
              <span class="fw-semibold">{{ book.publishYear }}</span>
            </p>

            <p class="mb-2">
              <span class="text-muted fw-bold">Số quyển còn lại: </span>
              <span class="fw-semibold text-danger">{{ book.number }}</span>
            </p>

            <p class="mb-3">
              <span class="text-muted fw-bold">Giá: </span>
              <span class="fw-semibold text-danger fw-bold">{{ book.unitCost }} VNĐ</span>
            </p>

            <div>
              <button v-if="!isBorrowing" @click="borrowing" class="btn btn-success w-100">
                Đăng kí mượn
              </button>
              <div v-else>
                <p class="fw-bold text-danger">Nhập số ngày bạn muốn mượn (7 - 60 ngày).</p>
                <div class="d-flex align-items-center">
                  <input type="number" v-model="borrowedDays" min="7" max="60" class="form-control me-2" />
                  <button class="btn btn-success me-2" @click="handleBorrow">Xác nhận</button>
                  <button class="btn btn-outline-secondary" @click="cancelBorrowing">Hủy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="comments-container border p-4 rounded bg-light h-100">
          <div class="comments-header fw-bold border-bottom pb-2 mb-3">Bình luận sách:</div>

          <div class="comment-input-container d-flex mb-4">
            <input v-model="formData.text" placeholder="Nhập bình luận của bạn..." class="form-control me-2" />
            <button @click="submitComment" class="btn btn-primary text-nowrap">Gửi bình luận</button>
          </div>

          <div v-if="userComments.length" class="comment-list overflow-auto pe-2" style="max-height: 400px;">
            <div class="comment-item p-3 mb-2 rounded border" v-for="comment in userComments" :key="comment._id">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="fw-bold text-primary">
                  {{ comment.user.username }}
                </div>
                <div class="text-muted small fst-italic text-end ms-2">
                  {{ countDay(comment) }}
                  <span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt">
                    (Đã chỉnh sửa <i class="fa-solid fa-gear"></i>)
                  </span>
                </div>
              </div>

              <div v-if="isEditing === comment._id" class="d-flex align-items-center mb-2">
                <input v-model="editedText" class="form-control form-control-sm me-2" />
                <button @click="saveEdit(comment._id)" class="btn btn-success btn-sm me-1 text-nowrap">Lưu</button>
                <button @click="cancelEdit" class="btn btn-outline-secondary btn-sm text-nowrap">Hủy</button>
              </div>

              <div v-else class="comment-text">{{ comment.text }}</div>

              <div v-if="auth?._id === comment.user._id" class="d-flex mt-2 justify-content-end align-items-center">
                <small v-if="isDeleting === comment._id" class="text-danger me-2">Bạn có muốn xóa bình luận?</small>
                <small v-if="isEditing === comment._id" class="text-warning me-2">Bạn có muốn sửa bình luận?</small>

                <template v-if="!isEditing && !isDeleting">
                  <button class="border-0 text-warning bg-transparent me-2" style="font-size: 12px"
                    @click="handleEdit(comment)">
                    <i class="fa-solid fa-pen-to-square"></i> Chỉnh sửa
                  </button>
                  <button class="border-0 text-danger bg-transparent" style="font-size: 12px"
                    @click="handleDelete(comment._id)">
                    <i class="fa-solid fa-trash"></i> Xóa
                  </button>
                </template>

                <template v-if="isDeleting === comment._id">
                  <button @click="confirmDelete" class="btn btn-danger btn-sm me-1 text-nowrap">Xóa</button>
                  <button @click="cancelDelete" class="btn btn-outline-secondary btn-sm text-nowrap">Hủy</button>
                </template>
              </div>
            </div>
          </div>
          <p v-else class="text-center text-muted">Chưa có bình luận nào.</p>
        </div>
      </div>
    </div>
    <div v-else class="loading text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải thông tin sách...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookStore } from "../../stores/book";
import { useBorrowStore } from "../../stores/borrow";
import { useAuthStore } from "../../stores/auth";
import { useCommentStore, type Comment } from "../../stores/comment";
import { useRoute } from "vue-router";
import { ref, onMounted, computed, reactive } from "vue";
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const route = useRoute();
const bookStore = useBookStore();
const borrowStore = useBorrowStore();
const authStore = useAuthStore();
const commentStore = useCommentStore();

const book = ref(null);
const auth = ref(null);
const comments = ref([]);
const formData = reactive<Comment>({
  id: "",
  user: "",
  book: "",
  text: "",
});
const borrowedDays = ref(7);
const isBorrowing = ref(false);
const isEditing = ref<string | null>(null);
const editedText = ref("");
const isDeleting = ref<string | null>(null);

const borrowing = () => {
  isBorrowing.value = true;
};

const cancelBorrowing = () => {
  isBorrowing.value = false;
};

const handleBorrow = async () => {
  try {
    const borrowData = {
      user: auth.value._id,
      book: book.value._id,
      borrowedDays: borrowedDays.value,
    };
    if (borrowedDays.value > 60 || borrowedDays.value < 7) {
      toast.error("Số ngày mượn phải từ 7 đến 60 ngày!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
      return;
    }
    await borrowStore.createBorrow(borrowData);
    toast.success("Yêu cầu của bạn đang chờ duyệt!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
    isBorrowing.value = false;
  } catch (error) {
    console.error("Error creating borrow:", error);
    if (error === "Request failed with status code 403") {
      toast.error("Bạn đã mượn vượt quá số lượng cho phép (5 quyển)", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    } else if (error === "Request failed with status code 400") {
      toast.error("Sách đã hết số lượng!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    } else {
      toast.error("Lỗi khi mượn sách!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    }
  }
};

const fetchBookData = async () => {
  try {
    const bookId = route.params.id;
    const [fetchedBook, fetchedComments, fetchedAuth] = await Promise.all([
      bookStore.getBookById(bookId),
      commentStore.getAllComment(),
      authStore.getUser(),
    ]);

    book.value = fetchedBook;
    auth.value = fetchedAuth;
    comments.value = fetchedComments.filter(
      (comment: any) => comment.book === book.value._id
    ).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (book.value) {
      formData.book = book.value._id;
      formData.user = auth.value?._id;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

function countDay(comment: any): string {
  const today = new Date();
  const updateDate = comment.updatedAt ? new Date(comment.updatedAt) : new Date(comment.createdAt);
  const diffSeconds = Math.floor((today.getTime() - updateDate.getTime()) / 1000);
  const diffYears = Math.floor(diffSeconds / (60 * 60 * 24 * 365));
  if (diffYears > 0) return `${diffYears} năm trước`;
  const diffMonths = Math.floor(diffSeconds / (60 * 60 * 24 * 30));
  if (diffMonths > 0) return `${diffMonths} tháng trước`;
  const diffWeeks = Math.floor(diffSeconds / (60 * 60 * 24 * 7));
  if (diffWeeks > 0) return `${diffWeeks} tuần trước`;
  const diffDays = Math.floor(diffSeconds / (60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} ngày trước`;
  const diffHours = Math.floor(diffSeconds / (60 * 60));
  if (diffHours > 0) return `${diffHours} giờ trước`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes > 0) return `${diffMinutes} phút trước`;
  return `${diffSeconds} giây trước`;
}

function handleEdit(comment: any) {
  isEditing.value = comment._id;
  editedText.value = comment.text;
}

async function saveEdit(commentId: string) {
  try {
    await commentStore.updateComment(commentId, editedText.value);
    isEditing.value = null;
    editedText.value = "";
    fetchBookData();
  } catch (error) {
    console.error("Error:", error);
    toast.error("Lỗi khi cập nhật bình luận!", { autoClose: 2000 });
  }
}

function cancelEdit() {
  isEditing.value = null;
  editedText.value = "";
}

async function handleDelete(commentId: string) {
  isDeleting.value = commentId;
}

async function confirmDelete() {
  try {
    await commentStore.deleteComment(isDeleting.value);
    isDeleting.value = null;
    fetchBookData();
  } catch (error) {
    console.error("Error: ", error);
    toast.error("Lỗi khi xóa bình luận!", { autoClose: 2000 });
  }
}

function cancelDelete() {
  isDeleting.value = null;
}

async function submitComment() {
  if (!formData.text.trim()) {
    toast.warn("Bình luận không được để trống.", { autoClose: 2000 });
    return;
  }
  try {
    await commentStore.createComment(formData);
    formData.text = "";
    fetchBookData();
  } catch (e) {
    console.log(e);
    toast.error("Lỗi khi gửi bình luận!", { autoClose: 2000 });
  }
}

onMounted(() => {
  fetchBookData();
});

const userComments = computed(() => comments.value);
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* --- Phần thông tin sách --- */
.book-cover {
  width: 250px;
  height: 350px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.book-details .card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-details .card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .book-cover {
    width: 180px;
    height: 250px;
  }
}

/* --- Phần bình luận --- */
.comments-container {
  background-color: #f8f9fa;
  border-color: #dee2e6 !important;
}

.comments-header {
  font-size: 1.25rem;
  color: #343a40;
}

.comment-input-container .form-control {
  border-radius: 0.375rem;
}

.comment-list {
  list-style: none;
  padding: 0;
}

.comment-item {
  background-color: #fff;
  border: 1px solid #e9ecef;
}

/* Tùy chỉnh input mượn sách */
.form-control[type="number"] {
  max-width: 80px;
  text-align: center;
}

/* Điều chỉnh lại font-size cho các nút nhỏ */
.btn-sm {
  font-size: 0.8rem;
}

.bg-transparent {
  background-color: transparent !important;
}
</style>