<template>
  <div class="p-4 mt-10 mr-2">
    <div class="mb-2 text-lg font-semibold">Trang chủ</div>
    <h5 class="mb-3 text-xl font-bold">Quản lí sách</h5>
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <div class="flex w-full md:w-auto">
        <input placeholder="Nhập thông tin cần tìm" v-model="query"
          class="outline-none w-full p-2 border-2 border-gray-500 rounded-l-lg" />
        <span class="p-2 bg-blue-500 text-white rounded-r-lg flex items-center">
          <font-awesome-icon :icon="faSearch" />
        </span>
      </div>
      <router-link :to="{ name: 'book:create' }" class="no-underline w-full md:w-auto">
        <div
          class="bg-blue-500 p-2 text-white rounded-lg text-center no-underline flex items-center justify-center gap-2">
          <font-awesome-icon :icon="faUserPlus" />
          Tạo sách
        </div>
      </router-link>
    </div>
    <div>
      <template v-if="!books.data || books.data.length === 0">
        <div class="text-center p-4 text-gray-500">Không có sách nào</div>
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
              <tr v-for="row in books.data" :key="row._id" class="hover:bg-gray-100 transition-colors">
                <td v-for="column in columns" :key="column.key" class="p-4 text-gray-800 border border-gray-300">
                  {{ renderCell(row, column) }}
                </td>
                <td class="p-4 text-gray-800 border border-gray-300">
                  <div class="flex gap-2">
                    <button @click="editBook(row)" class="text-blue-500 hover:text-blue-700">
                      Sửa
                    </button>
                    <button @click="deleteBook(row)" class="text-red-500 hover:text-red-700">
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
import { useBookStore } from "../../stores/book";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { toast, type ToastOptions } from 'vue3-toastify';

const router = useRouter();
const route = useRoute();
const bookStore = useBookStore();

// Khởi tạo các biến từ URL
const query = ref(route.query.q as string || "");
const pageNumber = ref(Number(route.query.pageNumber) || 1);
const limit = 5;

const books = computed(() => bookStore.allBooks);
const totalPage = computed(() => books.value.totalPage || 1);

const columns = [
  { title: "Tên sách", dataIndex: "name", key: "name" },
  { title: "Đơn giá", dataIndex: "unitCost", key: "unitCost" },
  { title: "Số lượng", dataIndex: "number", key: "number" },
  { title: "Năm xuất bản", dataIndex: "publishYear", key: "publishYear" },
  { title: "Tác giả", dataIndex: "author.name", key: "author" },
  { title: "Nhà xuất bản", dataIndex: "publisher.name", key: "publisher" },
];

// Hàm fetch data chính, có tham số tìm kiếm và phân trang
const fetchBooks = async (page: number, searchQuery: string) => {
  try {
    await bookStore.getAllBooks(page - 1, limit, searchQuery);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

onMounted(() => {
  // Lần đầu mount sẽ lấy dữ liệu từ URL
  fetchBooks(pageNumber.value, query.value);
});

// Watch để đồng bộ query và pageNumber với URL
watch(() => route.query, (newQuery) => {
  const newPage = Number(newQuery.pageNumber) || 1;
  const newQueryString = newQuery.q as string || "";

  // Chỉ fetch data khi có thay đổi thực sự ở pageNumber hoặc query
  if (newPage !== pageNumber.value || newQueryString !== query.value) {
    pageNumber.value = newPage;
    query.value = newQueryString;
    fetchBooks(pageNumber.value, query.value);
  }
}, { immediate: true });

// Khi người dùng nhập tìm kiếm, cập nhật URL và reset trang về 1
watch(query, (newQuery) => {
  router.push({ name: 'books', query: { ...route.query, pageNumber: 1, q: newQuery } });
});

// Hàm render cell
const renderCell = (row: any, column: any) => {
  const keys = column.dataIndex.split(".");
  let value = row;
  try {
    keys.forEach((key: any) => {
      value = value[key];
    });
  } catch (error) {
    console.error("Error accessing value for column:", column, "row:", row);
    value = "";
  }
  return value !== undefined && value !== null ? value : "";
};

// Hàm chuyển trang
const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPage.value) {
    router.push({ name: 'books', query: { ...route.query, pageNumber: newPage } });
  }
};

const editBook = (book: any) => {
  router.push({ name: "book:edit", params: { id: book._id } });
};

const deleteBook = async (book: any) => {
  const confirmed = confirm(`Bạn có chắc chắn muốn xóa sách ${book.name}?`);
  if (confirmed) {
    try {
      await bookStore.deleteBook(book._id);
      toast.success("Xóa sách thành công!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
      // Sau khi xóa, lấy lại dữ liệu cho trang hiện tại
      await fetchBooks(pageNumber.value, query.value);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Xóa sách thất bại!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    }
  }
};
</script>

<style scoped></style>