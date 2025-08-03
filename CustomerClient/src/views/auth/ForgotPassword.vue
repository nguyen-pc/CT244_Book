<template>
  <div class="forgot-password-page d-flex justify-content-center align-items-center">
    <div class="card p-4 shadow-lg border-0 forgot-password-card">
      <h5 class="card-title text-center text-success mb-4 fw-bold">Quên mật khẩu</h5>
      <p class="text-center text-muted mb-4">
        Nhập địa chỉ email của bạn để nhận liên kết.
      </p>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model="loginData.email" type="email" class="form-control" id="email"
            placeholder="Nhập địa chỉ email của bạn" required />
        </div>

        <button type="submit" class="btn btn-success w-100 fw-bold mt-2">
          Gửi yêu cầu
        </button>
      </form>

      <div class="mt-4 text-center">
        <router-link :to="{ name: 'login' }" class="text-muted text-decoration-none small">
          Quay lại trang đăng nhập
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const authStore = useAuthStore();
const router = useRouter();

const loginData = reactive({
  email: "",
});

async function submit() {
  try {
    await authStore.forgotPassword(loginData);
    toast.success("Vui lòng kiểm tra email của bạn để đặt lại mật khẩu!", {
      autoClose: 5000,
      position: toast.POSITION.TOP_CENTER,
    } as ToastOptions);
    router.replace({ name: "returnEmail" });
  } catch (err) {
    toast.error("Email không tồn tại trong hệ thống!", {
      autoClose: 3000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
  }
}
</script>

<style scoped>
.forgot-password-page {
  background-color: #f8f9fa;
  /* Màu nền nhẹ nhàng */
  min-height: 100vh;
}

.forgot-password-card {
  width: 100%;
  max-width: 450px;
  /* Tăng kích thước tối đa cho form */
  border-radius: 10px;
}

.form-label {
  font-weight: 500;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
  transition: background-color 0.3s ease;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}
</style>