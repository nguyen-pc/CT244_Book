<template>
  <div class="bg-nav">
    <nav class="navbar navbar-expand-lg bg-info p-3 rounded-3 shadow-sm mx-lg-5">
      <div class="container-fluid">
        <router-link class="navbar-brand" :to="{ name: 'home' }">
          <img class="logo me-2" src="../assets/images/logo.png" alt="Logo" />
          <span class="fw-bold text-success d-none d-sm-inline"></span>
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#appNavbar"
          aria-controls="appNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="appNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link :to="{ name: 'home' }" class="nav-link" active-class="active">Trang chủ</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'home' }" class="nav-link" active-class="active">Tin Sách</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'home' }" class="nav-link" active-class="active">Tác giả</router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'home' }" class="nav-link" active-class="active">Liên hệ</router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center my-2 my-lg-0 search-container">
            <div class="input-group">
              <input v-model="searchQuery" @keyup.enter="performSearch" placeholder="Tìm kiếm..."
                class="form-control rounded-pill pe-5" type="text" />
              <span class="input-group-text border-0 bg-transparent position-absolute end-0">
                <img class="img-search" src="../assets/images/search.png" alt="Search icon" />
              </span>
            </div>
          </div>

          <ul class="navbar-nav ms-lg-auto mb-2 mb-lg-0">
            <li v-if="isAuthenticated" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                <!-- <img :src="user.avatar || 'https://via.placeholder.com/150'" class="img me-2" alt="User avatar" /> -->
                <span class="d-inline d-lg-none d-xl-inline">{{ user.username }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link :to="{ name: 'BorrowHistory' }" class="dropdown-item">Lịch sử mượn sách</router-link>
                </li>
                <li>
                  <router-link :to="{ name: 'user' }" class="dropdown-item">Profile</router-link>
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger">Logout</button>
                </li>
              </ul>
            </li>
            <template v-else>
              <li class="nav-item">
                <router-link :to="{ name: 'login' }" class="btn btn-outline-success me-2 my-1">Đăng nhập</router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'register' }" class="btn btn-success my-1">Đăng ký</router-link>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const searchQuery = ref("");

const user = computed(() => {
  // Tránh lỗi nếu user chưa có
  return authStore.user || {};
});

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated;
});

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: "search", query: { q: searchQuery.value } });
    searchQuery.value = "";
  }
};

async function logout() {
  await authStore
    .logout()
    .then(() => {
      router.replace({ name: "home" });
    })
    .catch((err) => {
      console.error(err.message);
    });
}
</script>

<style scoped>
/* Reset một số thuộc tính CSS để Bootstrap hoạt động tốt hơn */
.navbar {
  box-sizing: border-box;
}

/* Các lớp tùy chỉnh cho giao diện */
.bg-nav {
  background-color: #e9f4ea !important;
  padding: 10px 0;
  /* Giảm padding trên dưới */
  border-bottom: 2px solid #5cb85c;
  /* Màu xanh lá nhạt hơn */
}

/* Tối ưu hóa Navbar */
.navbar {
  background-color: #f8f9fa !important;
  /* Dùng màu nền nhạt hơn để dễ nhìn */
}

/* Logo */
.logo {
  width: 40px;
  /* Giảm kích thước logo */
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* Tùy chỉnh các liên kết */
.nav-link {
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem !important;
  /* Tăng padding để các mục dễ bấm hơn */
  color: #333;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #0d6efd;
}

.nav-link.active {
  color: #0d6efd;
  font-weight: 600;
  border-bottom: 2px solid #0d6efd;
}

/* Thanh tìm kiếm */
.search-container {
  max-width: 300px;
  width: 100%;
}

.form-control.rounded-pill {
  border-radius: 50px !important;
  padding-right: 3rem !important;
  /* Dành chỗ cho icon tìm kiếm */
}

.img-search {
  width: 1rem;
  height: 1rem;
}

/* Ảnh đại diện người dùng */
.img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  /* Đảm bảo ảnh không bị méo */
  border: 1px solid #ccc;
}

/* Responsive cho dropdown menu */
.dropdown-menu {
  /* dropdown-menu-end giúp dropdown hiển thị từ phải sang trái trên desktop */
  min-width: 200px;
}

/* Các lớp tùy chỉnh khác */
.my-1 {
  margin-top: 0.25rem !important;
  margin-bottom: 0.25rem !important;
}

.me-2 {
  margin-right: 0.5rem !important;
}

.mx-lg-5 {
  margin-left: 3rem !important;
  margin-right: 3rem !important;
}

/* Media Queries cho màn hình nhỏ hơn 992px (màn hình lg) */
@media (max-width: 991.98px) {
  .search-container {
    max-width: none;
    margin-bottom: 1rem;
  }
}

/* Media Queries cho màn hình nhỏ hơn 576px (màn hình sm) */
@media (max-width: 575.98px) {
  .bg-nav {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .navbar-brand .text-success {
    display: none !important;
  }
}
</style>