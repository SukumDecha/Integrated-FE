<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
      <thead class="bg-gray-100">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key || col.dataIndex"
            class="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>

      <!-- ✅ ถ้ามีข้อมูล -->
      <tbody v-if="paginatedData.length > 0" class="divide-y divide-gray-200">
        <tr
          v-for="(row, rowIndex) in paginatedData"
          :key="row.id || rowIndex"
          class="itbms-row hover:bg-gray-50"
        >
          <td
            v-for="col in columns"
            :key="col.key || col.dataIndex"
            :class="['px-4 py-2 text-sm text-gray-800', col.key]"
          >
            <slot
              v-if="$slots[col.key]"
              :name="col.key"
              :record="row"
              :index="rowIndex"
            />
            <span v-else>
              {{ row[col.dataIndex] }}
            </span>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td
            :colspan="columns.length"
            class="text-center text-gray-500 py-8 text-sm"
          >
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ✅ Pagination -->
    <div v-if="pagination" class="flex justify-end items-center gap-2 mt-4">
      <button
        class="px-3 py-1 rounded bg-gray-200 text-sm"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        Previous
      </button>
      <span class="text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        class="px-3 py-1 rounded bg-gray-200 text-sm"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  pagination: {
    type: Object,
    default: null // Optional pagination
  },
  emptyText: {
    type: String,
    default: 'No data'
  }
});

const emit = defineEmits(['update:pagination']);

const currentPage = ref(props.pagination?.currentPage || 1);
const pageSize = computed(() => props.pagination?.pageSize || props.data.length);

const totalPages = computed(() => {
  const total = props.pagination?.total || props.data.length;
  return Math.ceil(total / pageSize.value);
});

const paginatedData = computed(() => {
  if (!props.pagination) return props.data;

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.data.slice(start, end);
});

function changePage(page) {
  currentPage.value = page;
  emit('update:pagination', {
    ...props.pagination,
    currentPage: page
  });
}

watch(
  () => props.pagination?.currentPage,
  (val) => {
    if (val) currentPage.value = val;
  }
);
</script>
