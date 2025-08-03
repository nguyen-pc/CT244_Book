<template>
  <div class="reset-password-page d-flex justify-content-center align-items-center">
    <div class="card p-4 shadow-lg border-0 reset-password-card">
      <h5 class="card-title text-center text-success mb-4 fw-bold">Đặt lại mật khẩu</h5>
      <p class="text-center text-muted mb-4">
        Nhập mật khẩu mới của bạn để hoàn tất quá trình.
      </p>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="password" class="form-label">Mật khẩu mới</label>
          <input v-model="resetPassword.password" type="password" class="form-control" id="password"
            placeholder="Nhập mật khẩu mới" required />
        </div>
        <div class="mb-3">
          <label for="confirm-password" class="form-label">Xác nhận mật khẩu</label>
          <input v-model="confirmPassword" type="password" class="form-control" id="confirm-password"
            placeholder="Nhập lại mật khẩu mới" required />
        </div>

        <button type="submit" class="btn btn-success w-100 fw-bold mt-2">
          Cập nhật mật khẩu
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
import { useAuthStore, type ResetPassword } from '../../stores/auth';
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const resetPassword = reactive<ResetPassword>({
  password: "",
  userId: "",
  token: "",
});
const confirmPassword = ref("");

onMounted(() => {
  const token = route.query.token as string;
  const userId = route.query.id as string;

  if (token && userId) {
    resetPassword.token = token;
    resetPassword.userId = userId;
  } else {
    toast.error("Liên kết đặt lại mật khẩu không hợp lệ!", {
      autoClose: 3000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
    router.replace({ name: "login" });
  }
});

async function submit() {
  if (resetPassword.password !== confirmPassword.value) {
    toast.error("Mật khẩu xác nhận không khớp!", {
      autoClose: 3000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
    return;
  }

  try {
    await authStore.resetPassword(resetPassword);
    toast.success("Mật khẩu của bạn đã được cập nhật thành công!", {
      autoClose: 3000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
    router.replace({ name: "login" });
  } catch (err) {
    toast.error("Có lỗi trong quá trình đặt lại mật khẩu. Vui lòng thử lại!", {
      autoClose: 3000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
  }
}
</script>

<style scoped>
.reset-password-page {
  background-color: #f8f9fa;
  /* Màu nền nhẹ nhàng */
  min-height: 100vh;
}

.reset-password-card {
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