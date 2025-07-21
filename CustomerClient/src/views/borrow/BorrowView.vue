<template>
  <div class="container d-flex justify-content-between responsive-book">
    <!-- Hiển thị sách nếu như tồn tại -->
    <div v-if="book" class="w-75 align-items-stretch">
      <div class="book-details flex w-100 align-self-stretch responsive-content">
        <div>
          <img :src="`http://localhost:3500/uploads/${book.cover}`" alt="Book Cover" class="book-cover" />
        </div>
        <div class="ms-4 card shadow-sm border-0 p-4" style="max-width: 500px;">
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
            <span class="fw-semibold text-danger fw-bold">{{ book.unitCost }} VND</span>
          </p>

          <button @click="handleBorrow" class="btn btn-success w-100">
            Đăng kí mượn
          </button>
        </div>

      </div>
    </div>
    <!-- Thông báo không hiển thị sách -->
    <div v-else class="loading">
      <p>Đang tải sách...</p>
    </div>
    <!-- Phần bình luận -->
    <div v-if="book" class="comments-container mt-2 border p-4 rounded w-50 responsive-comment">
      <div class="comments-header fw-bold">Bình luận sách:</div>
      <!-- Ô nhập bình luận -->
      <div class="comment-input-container d-flex">
        <input v-model="formData.text" placeholder="Nhập bình luận của bạn..."
          class="border border-secondary me-1 rounded shadow-sm flex-grow-1 custom-outline" />
        <button @click="submitComment" class="btn btn-primary">Gửi bình luận</button>
        <!--v-model="newComment"  @click="submitComment" -->
      </div>
      <!-- Danh sách bình luận -->
      <ul class="comment-list mt-4 overflow-auto" style="max-height: 300px;" v-if="userComments.length">
        <li class="comment-item" v-for="comment in userComments" :key="comment._id">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="fw-bold text-primary">
              {{ comment.user.username }}
            </div>
            <div class="text-muted small fst-italic">
              {{ countDay(comment) }}
              <span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt">
                (Đã chỉnh sửa <i class="fa-solid fa-gear"></i>)
              </span>
            </div>
          </div>

          <!-- Hiển thị ô input nếu đang chỉnh sửa -->
          <div v-if="isEditing === comment._id" class="d-flex align-items-center">
            <input v-model="editedText" class="form-control form-control-sm me-2" />
          </div>

          <!-- Nếu không chỉnh sửa thì chỉ hiển thị text -->
          <div v-else class="comment-text">{{ comment.text }}</div>

          <div v-if="auth._id === comment.user._id" class="d-flex mt-2 algin-items-center">
            <p class="me-auto mb-0" style="font-size: 12px;">
              <span v-if="isDeleting === comment._id" class="text-danger">Bạn có muốn xóa bình luận?</span>
              <span v-if="isEditing === comment._id" class="text-warning">Bạn có muốn sửa bình luận?</span>
            </p>
            <button v-if="isEditing !== comment._id && isDeleting !== comment._id" class="border-0 text-warning"
              style="font-size: 12px; width: 80px" @click="() => handleEdit(comment)">
              <i class="fa-solid fa-pen-to-square"></i>
              Chỉnh sửa
            </button>
            <button v-if="isEditing !== comment._id && isDeleting !== comment._id" class="border-0 text-danger ms-2"
              style="font-size: 12px; width: 80px" @click="() => handleDelete(comment._id)">
              <i class="fa-solid fa-trash"></i>
              Xóa
            </button>
            <!-- Hiển thị khi chọn sửa bình luận -->
            <button v-if="isEditing === comment._id" @click="saveEdit(comment._id)" class="border-0 text-warning"
              style="font-size: 12px; width: 80px">
              <i class="fa-solid fa-circle-check"></i>
              Xác nhận
            </button>
            <button v-if="isEditing === comment._id" @click="cancelEdit" class="border-0 text-danger ms-2"
              style="font-size: 12px; width: 80px"> <i class="fa-solid fa-circle-xmark"></i> Hủy</button>
            <!-- Hiển thị khi xóa bình luận -->
            <button v-if="isDeleting === comment._id" @click="confirmDelete" class="border-0 text-danger"
              style="font-size: 12px; width: 80px">
              <i class="fa-solid fa-circle-check"></i>
              Xóa
            </button>
            <button v-if="isDeleting === comment._id" @click="cancelDelete" class="border-0 text-secondary ms-2"
              style="font-size: 12px; width: 80px"> <i class="fa-solid fa-circle-xmark"></i> Hủy</button>
          </div>
        </li>
      </ul>
      <p v-else>Không có bình luận nào.</p>
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
  user: '',
  book: "",
  text: ""
});

const handleBorrow = async () => {
  try {
    const borrowData = {
      user: auth.value._id,
      book: book.value._id,
      borrowedDays: 7,
    };
    await borrowStore.createBorrow(borrowData);


    toast.success("Mượn sách thành công!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions)

    if (book.value.number > 0) {
      book.value.number -= 1;
    }
  } catch (error) {
    console.error("Error creating borrow:", error);
    if (error == "Request failed with status code 403")
      toast.error("Bạn đã mượn vượt quá số lượng cho phép (5 quyển)", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions)
    else if (error == "Request failed with status code 400")
      toast.error("Sách đã hết số lượng!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions)
    else ("Lỗi khi mượn sách!")
  }

};

const fetchBookData = async () => {
  try {
    const bookId = route.params.id;
    const fetchedBook = await bookStore.getBookById(bookId);
    const fetchedComments = await commentStore.getAllComment();
    const fetchedAuth = await authStore.getUser();

    book.value = fetchedBook;
    auth.value = fetchedAuth;
    comments.value = fetchedComments;
    formData.book = fetchedBook
    formData.user = fetchedAuth

    // Lọc các bình luận cho người dùng hiện tại và sách hiện tại
    comments.value = fetchedComments.filter((fetchedComment: any) => {
      return (
        fetchedComment.book === book.value._id
      );
    });

    comments.value = comments.value.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log(comments.value);
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

const isEditing = ref<string | null>(null);
const editedText = ref("");
function handleEdit(comment: any) {
  isEditing.value = comment._id;
  editedText.value = comment.text;
}

async function saveEdit(commentId: string) {
  try {
    await commentStore.updateComment(commentId, editedText.value);
    isEditing.value = null;
    editedText.value = "";
    await fetchBookData();
  } catch (error) {
    console.error("Error:", error);
  }
}

function cancelEdit() {
  isEditing.value = null;
  editedText.value = "";
}

const isDeleting = ref<string | null>(null);
async function handleDelete(commentId: string) {
  isDeleting.value = commentId
}

async function confirmDelete() {
  try {
    await commentStore.deleteComment(isDeleting.value);
    await fetchBookData();
  } catch (error) {
    console.error("Error: ", error);
  }
}

function cancelDelete() {
  isDeleting.value = null
}


async function submitComment() {
  try {
    const newComment = await commentStore.createComment(formData)
    formData.text = "";
    comments.value.unshift(newComment)
    fetchBookData()
  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  fetchBookData();
});

const userComments = computed(() => comments.value);
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background-color: #fff;
}

.book-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.book-author {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
}

.book-cover {
  height: 100%;
  width: 100%;
  margin-bottom: 20px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-info {
  font-size: 1.2rem;
  margin: 10px 0;
  color: #555;
}

.book-info span {
  font-weight: bold;
  color: #000;
}

.flex {
  display: flex;
}

.ml-20 {
  margin-left: 100px;
}

/* comment */

/* Bình luận */

.comments-header {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 5px;
}

.comment-list {
  list-style: none;
  padding: 0;
}

.custom-outline {
  outline: none;
  padding: 10px;
}

.comment-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-text {
  font-size: 1rem;
  color: #555;
}

.comment-date {
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.comment-author {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

/* Ô nhập bình luận */
.comment-input-container {
  margin-top: 20px;
}

.ml {
  margin-left: 40px;
}

.mr {
  margin-right: 200px;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-success {
  background-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
}

.loading {
  text-align: center;
  font-size: 1.5rem;
  color: #777;
}

@media screen and (max-width: 1200px) {
  .responsive-book {
    flex-wrap: wrap;
    margin: 0 auto !important;
    justify-content: center !important;
  }

  .responsive-content {
    justify-content: center !important;
    margin: 20px auto !important;
    width: 100% !important;
  }

  .responsive-comment {
    margin-top: 20px;
    width: 100% !important;
  }
}
</style>
