<template>
  <div id="login">
    <div class="container">
      <div class="card card-body mt-4">
        <h5 class="card-title">Forgot Password</h5>
        <form @submit.prevent="submit">
          <div class="mb-3">
            <label for="password" class="form-label">Nhập password mới: </label>
            <input
              v-model="resetPassword.password"
              type="password"
              class="form-control"
              id="password"
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
import { useAuthStore, type ResetPassword } from '../../stores/auth';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';

import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute();
import { onMounted } from 'vue';


onMounted(() => {
  const token = route.query.token as string;
  const userId = route.query.id as string;

  if (token && userId) {
    resetPassword.token = token;
    resetPassword.userId = userId;
  } else {
    toast.error("Link đặt lại mật khẩu không hợp lệ!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
    } as ToastOptions);
    router.replace({ name: "login" });
  }
});


const resetPassword = reactive<ResetPassword>({
  password: "",
  userId: "",
  token: "",
  })

const errorMessage = ref<string>("")

const signUp = () => {
  router.push({ name: "register" });
};

async function submit(){
  await authStore.resetPassword(resetPassword)
    .then(res => {
      toast.success("Đổi mật khẩu thành công!", {
      autoClose: 2000,
      position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions)
      router.replace({name: "login"})
    })
    .catch(err => {
      toast.error("Có lỗi trong quá trình đặt lại mật khẩu!", {
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
