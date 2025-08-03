<template>
  <div class="login-page d-flex justify-content-center align-items-center">
    <div class="card p-4 shadow-lg border-0 login-card">
      <h5 class="card-title text-center text-success mb-4 fw-bold">Đăng nhập</h5>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model="loginData.email" type="email" class="form-control" id="email" placeholder="example@gmail.com"
            required />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Mật khẩu</label>
          <input v-model="loginData.password" type="password" class="form-control" id="password"
            placeholder="Nhập mật khẩu của bạn" required />
        </div>
        <button type="submit" class="btn btn-success w-100 fw-bold mt-2">Đăng nhập</button>
      </form>

      <div class="mt-3 text-center">
        <a href="http://localhost:3006/forgotPassword" class="text-muted text-decoration-none small">Quên mật khẩu?</a>
      </div>

      <div class="mt-4 text-center border-top pt-3">
        <p class="mb-1 text-muted small">Bạn chưa có tài khoản?</p>
        <router-link :to="{ name: 'register' }" class="btn btn-outline-success w-100">
          Đăng ký ngay
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore, type LoginData } from '../../stores/auth';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const authStore = useAuthStore()
const router = useRouter()

const loginData = reactive<LoginData>({
  email: "",
  password: "",
})

const submit = async () => {
  try {
    await authStore.login(loginData)
    toast.success("Đăng nhập thành công!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions)
    router.replace({ name: "home" })
  } catch (err) {
    toast.error("Email hoặc mật khẩu chưa đúng!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
  }
}
</script>

<style scoped>
.login-page {
  background-color: #f8f9fa;
  /* Màu nền nhẹ nhàng */
  min-height: 100vh;
}

.login-card {
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

.btn-outline-success {
  transition: all 0.3s ease;
}

.btn-outline-success:hover {
  color: #fff;
  background-color: #28a745;
}
</style>