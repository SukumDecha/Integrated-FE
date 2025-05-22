<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
      <thead class="bg-gray-100">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key || col.dataIndex"
            :class="[
              'px-4 py-2 text-sm font-semibold text-gray-700 uppercase tracking-wider',
              getAlignmentClass(col.align)
            ]"
            :style="getWidthStyle(col.width)"
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
            :class="[
              'px-4 py-2 text-sm text-gray-800',
              getAlignmentClass(col.align),
              col.key
            ]"
            :style="getWidthStyle(col.width)"
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
  </div>

   <!-- ✅ Pagination with Size Changer -->
    <div v-if="pagination" class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
      <!-- Size Changer -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-sm text-gray-600 whitespace-nowrap">Show</span>
        <select
          v-model="currentPageSize"
          @change="handlePageSizeChange"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <span class="text-sm text-gray-600 whitespace-nowrap">entries</span>
      </div>

      <!-- Pagination Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <!-- Page Info -->
        <span class="text-sm text-gray-600 text-center sm:text-left sm:mr-4 order-2 sm:order-1">
          {{ paginationInfo }}
        </span>

        <!-- Scrollable Pagination Buttons -->
        <div class="overflow-x-auto order-1 sm:order-2">
          <div class="flex items-center gap-2 min-w-max px-1">
            <!-- First -->
            <XButton
              class="itbms-page-first flex-shrink-0"
              :disabled="currentPage === 1"
              @click="changePage(1)">
              First
            </XButton>
            <!-- Previous -->
            <XButton
              class="itbms-page-prev flex-shrink-0"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <ArrowLeft class="w-5 h-5" />
            </XButton>

            <!-- Page Numbers -->
            <template v-for="(page, index) in visiblePages" :key="page">
              <span v-if="page === '...'" class="px-2 text-gray-400 flex-shrink-0">...</span>
              <XButton
                v-else
                :class="[
                  'flex-shrink-0',
                  `itbms-page-${index}`,
                  currentPage === page ? '!font-bold' : ''
                ]"
                :variant="currentPage === page ? 'primary' : 'outline'"
                @click="changePage(page)"
              >
                {{ page }}
              </XButton>
            </template>

            <!-- Next -->
            <XButton
              class="itbms-page-next flex-shrink-0"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              <ArrowRight class="w-5 h-5" />
            </XButton>
            <!-- Last -->
            <XButton
              class="itbms-page-last flex-shrink-0"
              :disabled="currentPage === totalPages"
              @click="changePage(totalPages)"
            >
              Last
            </XButton>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import XButton from './XButton.vue'
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
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  maxVisiblePages: {
    type: Number,
    default: 7
  }
});

const emit = defineEmits(['change']);

const currentPage = ref(props.pagination?.currentPage || 1);
const currentPageSize = ref(props.pagination?.pageSize || props.pageSizeOptions[0]);

const totalPages = computed(() => {
  const total = props.pagination?.total || props.data.length;
  return Math.ceil(total / currentPageSize.value);
});

const paginatedData = computed(() => {
  if (!props.pagination) return props.data;

  const start = (currentPage.value - 1) * currentPageSize.value;
  const end = start + currentPageSize.value;
  return props.data.slice(start, end);
});

// Generate visible page numbers with ellipsis
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = props.maxVisiblePages;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);

  if (current <= halfVisible + 1) {
    // Show pages from start
    for (let i = 1; i <= maxVisible - 2; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(total);
  } else if (current >= total - halfVisible) {
    // Show pages from end
    pages.push(1);
    pages.push('...');
    for (let i = total - maxVisible + 3; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show pages around current
    pages.push(1);
    pages.push('...');
    for (let i = current - halfVisible + 2; i <= current + halfVisible - 2; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(total);
  }

  return pages;
});

// Pagination info text
const paginationInfo = computed(() => {
  const total = props.pagination?.total || props.data.length;
  const start = (currentPage.value - 1) * currentPageSize.value + 1;
  const end = Math.min(currentPage.value * currentPageSize.value, total);
  return `${start}-${end} of ${total}`;
});

function changePage(page) {
  if (page === currentPage.value) return;

  currentPage.value = page;
  const newPagination = {
    ...props.pagination,
    currentPage: page,
    pageSize: currentPageSize.value
  };

  emit('change', newPagination);
}

function handlePageSizeChange() {
  // Reset to first page when changing page size
  currentPage.value = 1;
  const newPagination = {
    ...props.pagination,
    currentPage: 1,
    pageSize: currentPageSize.value
  };

  emit('change', newPagination);
}

function getAlignmentClass(align) {
  switch (align) {
    case 'right':
      return 'ml-auto text-right';
    case 'center':
      return 'mx-auto text-center';
    case 'left':
    default:
      return 'mr-auto text-left';
  }
}

function getWidthStyle(width) {
  return width ? { width } : {};
}

// Watch for external pagination changes
watch(
  () => props.pagination?.currentPage,
  (val) => {
    if (val && val !== currentPage.value) {
      currentPage.value = val;
    }
  }
);

watch(
  () => props.pagination?.pageSize,
  (val) => {
    if (val && val !== currentPageSize.value) {
      currentPageSize.value = val;
    }
  }
);
</script>
