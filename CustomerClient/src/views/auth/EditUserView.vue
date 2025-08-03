<template>
  <div class="user-profile-page d-flex justify-content-center align-items-center">
    <div v-if="user" class="card p-4 shadow-lg border-0 profile-card">
      <h5 class="card-title text-center text-success mb-4 fw-bold">Cập nhật thông tin cá nhân</h5>
      <p v-if="errorMessage" class="text-danger text-center mb-4">
        {{ errorMessage }}
      </p>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label for="username" class="form-label">Tên đăng nhập</label>
          <input v-model="formData.username" type="text" class="form-control" id="username" autocomplete="off"
            required />
        </div>
        <div class="mb-3">
          <label for="first_name" class="form-label">Tên</label>
          <input v-model="formData.first_name" type="text" class="form-control" id="first_name" autocomplete="off"
            required />
        </div>
        <div class="mb-3">
          <label for="last_name" class="form-label">Họ</label>
          <input v-model="formData.last_name" type="text" class="form-control" id="last_name" autocomplete="off"
            required />
        </div>
        <div class="mb-4">
          <label for="email" class="form-label">Địa chỉ email</label>
          <input v-model="formData.email" type="email" class="form-control" id="email" autocomplete="off" required />
        </div>

        <button type="submit" class="btn btn-success w-100 fw-bold mt-2">
          Cập nhật thông tin
        </button>
      </form>
    </div>
    <div v-else class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Đang tải thông tin người dùng...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAuthStore, type EditData } from "../../stores/auth";
import { computed, onMounted, reactive, ref } from "vue";
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const errorMessage = ref<string>("");

const formData = reactive<EditData>({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
});

const user = computed(() => authStore.userDetail);

onMounted(async () => {
  try {
    await authStore.getUser();
    if (user.value) {
      formData.username = user.value.username;
      formData.email = user.value.email;
      formData.first_name = user.value.first_name;
      formData.last_name = user.value.last_name;
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    errorMessage.value = 'Không thể tải thông tin người dùng.';
    toast.error('Không thể tải thông tin người dùng!', { autoClose: 3000 });
  }
});

async function submit() {
  try {
    const updatedUser = await authStore.updateUser(route.params.id, formData);
    if (updatedUser) {
      toast.success('Cập nhật thông tin thành công!', {
        autoClose: 3000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
      router.push({ name: "user" }); // Điều hướng về trang profile sau khi cập nhật
    }
  } catch (err: any) {
    console.error('Error updating user:', err);
    errorMessage.value = err.message || 'Lỗi khi cập nhật thông tin.';
    toast.error(errorMessage.value, { autoClose: 3000 });
  }
}
</script>

<style scoped>
.user-profile-page {
  background-color: #f8f9fa;
  /* Màu nền nhẹ nhàng */
  min-height: 100vh;
}

.profile-card {
  width: 100%;
  max-width: 500px;
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