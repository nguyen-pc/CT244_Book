<template>
  <div class="col-12">
    <div class="d-flex flex-wrap justify-content-center g-4">
      <div v-for="data in filteredData" :key="data.id" class="card-wrapper">
        <div class="card h-100 shadow-sm border-0">
          <img :src="`http://localhost:3500/uploads/${data.cover}`" class="card-img-top book-cover" alt="book cover" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title fw-bold text-truncate">{{ data.name }}</h5>
            <p class="card-text text-muted mb-auto">Số lượng: {{ data.number }}</p>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="fw-bold text-success">{{ formatPrice(data.unitCost) }}</span>
              <button @click="borrowBook(data)" class="btn btn-sm btn-outline-primary">
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useBookStore } from "../../src/stores/book";

const router = useRouter();
const route = useRoute();
const bookStore = useBookStore();

const pageNumber = computed(() => Number(route.query.pageNumber) || 1);
const limit = 10;

const fetchBooks = async () => {
  try {
    await bookStore.getAllBooks(pageNumber.value - 1, limit);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

onMounted(fetchBooks);

const filteredData = computed(() => {
  return (bookStore.allBooks as any)?.data || [];
});

const borrowBook = (book: any) => {
  router.push({ name: "Borrow", params: { id: book._id } });
};

const formatPrice = (price: number) => {
  if (!price) return '0 VNĐ';
  return `${price.toLocaleString('vi-VN')} VNĐ`;
};
</script>

<style scoped>
/* Wrapper cho từng card để kiểm soát kích thước */
.card-wrapper {
  flex: 0 0 auto;
  /* Không co giãn, không thu nhỏ */
  width: 250px;
  /* Chiều rộng cố định cho mỗi card */
  margin: 10px;
  /* Khoảng cách giữa các card */
}

/* Cài đặt cho thẻ card */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Ảnh bìa sách */
.book-cover {
  width: 100%;
  height: 350px;
  object-fit: cover;
  /* Cắt ảnh để vừa khung hình mà không bị méo */
  border-top-left-radius: calc(0.25rem - 1px);
  border-top-right-radius: calc(0.25rem - 1px);
}

/* Tiêu đề sách */
.card-title {
  height: 2.5rem;
  /* Đặt chiều cao cố định để tránh layout bị nhảy */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* Giới hạn 2 dòng */
  -webkit-box-orient: vertical;
}

.card-body {
  padding: 1rem;
}

.d-flex.flex-wrap {
  gap: 1.5rem;
  /* Tạo khoảng cách giữa các card */
}
</style>