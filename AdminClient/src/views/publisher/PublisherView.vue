<template>
  <div class="p-4 mt-10">
    <div class="mb-2 text-lg font-semibold">Trang chủ</div>
    <h5 class="mb-3 text-xl font-bold">Quản lí Nhà xuất bản</h5>
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <div class="flex w-full md:w-auto">
        <input placeholder="Nhập thông tin cần tìm" v-model="query"
          class="outline-none w-full p-2 border-2 border-gray-500 rounded-l-lg" />
        <span class="p-2 bg-blue-500 text-white rounded-r-lg flex items-center">
          <font-awesome-icon :icon="faSearch" />
        </span>
      </div>
      <router-link :to="{ name: 'publisher:create' }" class="no-underline w-full md:w-auto">
        <div
          class="bg-blue-500 p-2 text-white rounded-lg text-center no-underline flex items-center justify-center gap-2">
          <font-awesome-icon :icon="faUserPlus" />
          Tạo Nhà xuất bản
        </div>
      </router-link>
    </div>
    <div>
      <template v-if="!paginatedData.length">
        <div class="text-center p-4 text-gray-500">Không có nhà xuất bản nào</div>
      </template>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
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
              <tr v-for="row in paginatedData" :key="row.id" class="hover:bg-gray-100 transition-colors">
                <td v-for="column in columns" :key="column.key" class="p-4 text-gray-800 border border-gray-300">
                  {{ renderCell(row, column) }}
                </td>
                <td class="p-4 text-gray-800 border border-gray-300">
                  <div class="flex gap-2">
                    <button @click="editPublisher(row)" class="text-blue-500 hover:text-blue-700">
                      Sửa
                    </button>
                    <button @click="deletePublisher(row)" class="text-red-500 hover:text-red-700">
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

    <nav v-if="totalFilteredPages > 1" aria-label="Pagination" class="mt-4 flex justify-center">
      <ul class="flex gap-2 items-center">
        <li>
          <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)"
            class="bg-gray-200 p-2 rounded-lg disabled:opacity-50">
            Trước
          </button>
        </li>
        <li v-for="page in totalFilteredPages" :key="page">
          <button @click="changePage(page)" :class="[
            'p-2 rounded-lg',
            page === currentPage ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'
          ]">
            {{ page }}
          </button>
        </li>
        <li>
          <button :disabled="currentPage === totalFilteredPages" @click="changePage(currentPage + 1)"
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
import { usePublisherStore } from "../../stores/publisher";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { toast, type ToastOptions } from 'vue3-toastify';

const router = useRouter();
const route = useRoute();
const publisherStore = usePublisherStore();

const query = ref(route.query.q as string || "");
const currentPage = ref(Number(route.query.page) || 1);
const limit = 5;

const fetchAllPublishers = async () => {
  try {
    // Fetch all data initially to enable front-end filtering
    await publisherStore.getAllPublishers();
  } catch (error) {
    console.error("Error fetching publishers:", error);
  }
};

onMounted(() => {
  // Initial fetch on component mount
  fetchAllPublishers();
});

// Watch for changes in query to update URL and reset page
watch(query, (newQuery) => {
  currentPage.value = 1;
  router.push({ query: { ...route.query, q: newQuery, page: 1 } });
});

// Watch for changes in currentPage to update the URL
watch(currentPage, (newPage) => {
  router.push({ query: { ...route.query, page: newPage } });
});

const publishers = computed(() => publisherStore.allPublishers);

// First, filter all publishers based on the query
const filteredPublishers = computed(() => {
  const allData = publishers.value.data || [];
  if (!query.value) {
    return allData;
  }
  const lowerCaseQuery = query.value.toLowerCase();
  return allData.filter((item: any) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(lowerCaseQuery)
    );
  });
});

// Then, paginate the filtered data
const totalFilteredPages = computed(() => Math.ceil(filteredPublishers.value.length / limit));
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * limit;
  const end = start + limit;
  return filteredPublishers.value.slice(start, end);
});

const columns = [
  { title: "Tên nhà xuất bản", dataIndex: "name", key: "name" },
  { title: "Địa chỉ", dataIndex: "address", key: "address" },
];

const renderCell = (row: any, column: any) => {
  return row[column.dataIndex];
};

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalFilteredPages.value) {
    currentPage.value = newPage;
  }
};

const editPublisher = (publisher: any) => {
  router.push({ name: "publisher:edit", params: { id: publisher._id } });
};

const deletePublisher = async (publisher: any) => {
  const confirmed = confirm(`Bạn có chắc chắn muốn xóa nhà xuất bản ${publisher.name}?`);
  if (confirmed) {
    try {
      await publisherStore.deletePublisher(publisher._id);
      toast.success("Xóa nhà xuất bản thành công!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
      // Re-fetch all data to update the list and pagination
      await fetchAllPublishers();
    } catch (error) {
      console.error("Error deleting publisher:", error);
      toast.error("Xóa nhà xuất bản thất bại!", {
        autoClose: 2000,
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);
    }
  }
};
</script>