<template>
  <div class="p-4 mt-10 mr-2">
    <div class="mb-2 text-lg font-semibold">Trang chủ</div>
    <h5 class="mb-3 text-xl font-bold">Quản lí Tác giả</h5>
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <div class="flex w-full md:w-auto">
        <input placeholder="Nhập thông tin cần tìm" v-model="query"
          class="outline-none w-full p-2 border-2 border-gray-500 rounded-l-lg" />
        <span class="p-2 bg-blue-500 text-white rounded-r-lg flex items-center">
          <font-awesome-icon :icon="faSearch" />
        </span>
      </div>
      <router-link :to="{ name: 'author:create' }" class="no-underline w-full md:w-auto">
        <div
          class="bg-blue-500 p-2 text-white rounded-lg text-center no-underline flex items-center justify-center gap-2">
          <font-awesome-icon :icon="faUserPlus" />
          Tạo Tác giả
        </div>
      </router-link>
    </div>
    <div>
      <template v-if="!paginatedData.length">
        <div class="text-center p-4 text-gray-500">Không có tác giả nào</div>
      </template>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse table-auto">
            <thead class="bg-gray-200">
              <tr>
                <th v-for="column in columns" :key="column.key"
                  class="p-4 text-left text-gray-600 font-bold border border-gray-300">
                  {{ column.title }}
                </th>
                <th class="p-4 text-left text-gray-600 font-bold border border-gray-300">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in paginatedData" :key="row._id" class="hover:bg-gray-100 transition-colors">
                <td v-for="column in columns" :key="column.key" class="p-4 text-gray-800 border border-gray-300">
                  {{ renderCell(row, column) }}
                </td>
                <td class="p-4 text-gray-800 border border-gray-300">
                  <div class="flex gap-2">
                    <button @click="editAuthor(row)" class="text-blue-500 hover:text-blue-700">
                      Sửa
                    </button>
                    <button @click="deleteAuthor(row)" class="text-red-500 hover:text-red-700">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <nav v-if="totalPage > 1" aria-label="Pagination" class="mt-4 flex justify-center">
      <ul class="flex gap-2 items-center">
        <li>
          <button :disabled="pageNumber === 1" @click="changePage(pageNumber - 1)"
            class="bg-gray-200 p-2 rounded-lg disabled:opacity-50">
            Trước
          </button>
        </li>
        <li v-for="page in totalPage" :key="page">
          <button @click="changePage(page)" :class="[
            'p-2 rounded-lg',
            page === pageNumber ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'
          ]">
            {{ page }}
          </button>
        </li>
        <li>
          <button :disabled="pageNumber === totalPage" @click="changePage(pageNumber + 1)"
            class="bg-gray-200 p-2 rounded-lg disabled:opacity-50">
            Sau
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed, watch } from "vue";
import { useAuthorStore } from "../../stores/author";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { toast, type ToastOptions } from 'vue3-toastify';

const router = useRouter();
const route = useRoute();
const authorStore = useAuthorStore();

// Khởi tạo các biến từ URL
const query = ref(route.query.q as string || "");
const pageNumber = ref(Number(route.query.pageNumber) || 1);
const limit = 5;

const columns = [
  { title: "Tên Tác giả", dataIndex: "name", key: "name" },
  { title: "Địa chỉ", dataIndex: "address", key: "address" },
];

const author = computed(() => authorStore.allAuthors);
const paginatedData = computed(() => author.value.data || []);
const totalPage = computed(() => author.value.totalPage || 1);

// Hàm fetch data chính, có tham số tìm kiếm và phân trang
const fetchAuthor = async (page: number, searchQuery: string) => {
  try {
    await authorStore.getAllAuthors(page - 1, limit, searchQuery);
  } catch (error) {
    console.error("Error fetching authors:", error);
  }
};

onMounted(() => {
  // Lần đầu mount sẽ lấy dữ liệu từ URL
  fetchAuthor(pageNumber.value, query.value);
});

// Watch để đồng bộ query và pageNumber với URL
watch(() => route.query, (newQuery) => {
  const newPage = Number(newQuery.pageNumber) || 1;
  const newQueryString = newQuery.q as string || "";

  // Chỉ fetch data khi có thay đổi thực sự ở pageNumber hoặc query
  if (newPage !== pageNumber.value || newQueryString !== query.value) {
    pageNumber.value = newPage;
    query.value = newQueryString;
    fetchAuthor(pageNumber.value, query.value);
  }
}, { immediate: true });

// Khi người dùng nhập tìm kiếm, cập nhật URL và reset trang về 1
watch(query, (newQuery) => {
  router.push({ name: 'author', query: { ...route.query, pageNumber: 1, q: newQuery } });
});

// Hàm render cell
const renderCell = (row: any, column: any) => {
  return row[column.dataIndex];
};

// Hàm chuyển trang
const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPage.value) {
    router.push({ name: 'author', query: { ...route.query, pageNumber: newPage } });
  }
};

const editAuthor = (author: any) => {
  router.push({ name: "author:edit", params: { id: author._id } });
};

const deleteAuthor = async (author: any) => {
  const confirmed = confirm(`Bạn có chắc chắn muốn xóa Tác giả ${author.name}?`);
  if (confirmed) {
    try {
      await authorStore.deleteAuthor(author._id);
      toast.success("Xóa tác giả thành công!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
      // Sau khi xóa, lấy lại dữ liệu cho trang hiện tại
      await fetchAuthor(pageNumber.value, query.value);
    } catch (error) {
      console.error("Error deleting author:", error);
      toast.error("Xóa tác giả thất bại!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    }
  }
};
</script>

<style scoped>
/*
Bạn có thể xóa hết phần này vì đã dùng Tailwind
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
}
*/
</style>