<template>
  <div id="login">
    <div class="container">
      <div class="card card-body mt-4">
        <h5 class="card-title">Forgot Password</h5>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input
              v-model="loginData.email"
              type="email"
              class="form-control"
              id="email"
              autocomplete="off"
            />
          </div>

          <button type="submit" class="btn btn-success">Submit</button>
        </form>
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
})

const errorMessage = ref<string>("")

const signUp = () => {
  router.push({ name: "register" });
};

async function submit(){
  await authStore.forgotPassword(loginData)
    .then(res => {
      toast.success("Đăng nhập thành công!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions)
      router.replace({name: "returnEmail"})
    })
    .catch(err => {
      toast.error("Email hoặc mật khẩu chưa đúng!", {
         autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
     } as ToastOptions);
      errorMessage.value = err.message
    })
}
</script>

<style scoped>
#login .card {
  max-width: 40vw;
  margin: auto;
}

.sign-up {
  margin-top: 10px;
}
.sign-up-child {
  color: green;
  cursor: pointer;
}
</style>
