
<script setup>
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import XButton from './XButton.vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100]
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  maxVisiblePages: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['change']);

const currentPage = ref(props.pagination.currentPage);
const currentPageSize = ref(props.pagination.pageSize);

watch(
  () => props.pagination.currentPage,
  (newVal) => {
    console.log("Updating currentPage from props:", newVal);
    if (newVal !== currentPage.value) {
      currentPage.value = newVal;
    }
  }
);

watch(
  () => props.pagination.pageSize,
  (newVal) => {
    console.log("Updating currentPageSize from props:", newVal);
    if (newVal !== currentPageSize.value) {
      currentPageSize.value = newVal;
    }
  }
);

const totalPages = computed(() => {
  return Math.ceil(props.pagination.total / currentPageSize.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = props.maxVisiblePages;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  if (current <= maxVisible) {
    for (let i = 1; i <= maxVisible; i++) {
      pages.push(i);
    }
  } else if (current >= maxVisible) {
    const offSet = current - maxVisible + 1
    for (let i = offSet; i <= maxVisible + offSet - 1; i++) {
      pages.push(i);
    }
  }

  // const halfVisible = Math.floor(maxVisible / 2);

  // if (current <= halfVisible + 1) {
  //   // Show pages from start
  //   for (let i = 1; i <= maxVisible - 2; i++) {
  //     pages.push(i);
  //   }
  //   pages.push('...');
  //   pages.push(total);
  // } else if (current >= total - halfVisible) {
  //   // Show pages from end
  //   pages.push(1);
  //   pages.push('...');
  //   for (let i = total - maxVisible + 3; i <= total; i++) {
  //     pages.push(i);
  //   }
  // } else {
  //   // Show pages around current
  //   pages.push(1);
  //   pages.push('...');
  //   for (let i = current - halfVisible + 2; i <= current + halfVisible - 2; i++) {
  //     pages.push(i);
  //   }
  //   pages.push('...');
  //   pages.push(total);
  // }

  return pages;
});

const paginationInfo = computed(() => {
  const total = props.pagination.total;
  const start = (currentPage.value - 1) * currentPageSize.value + 1;
  const end = Math.min(currentPage.value * currentPageSize.value, total);
  return `${start}-${end} of ${total}`;
});

function changePage(page) {
  if (page === currentPage.value || page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit('change', { currentPage: page, pageSize: currentPageSize.value });
}

function handlePageSizeChange() {
  currentPage.value = 1;
  emit('change', { currentPage: 1, pageSize: currentPageSize.value });
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
    <!-- Size Changer -->
    <div v-if="showSizeChanger" class="flex items-center gap-2 flex-shrink-0">
      <span class="text-sm text-gray-600 whitespace-nowrap">Show</span>
      <select
        v-model="currentPageSize"
        @change="handlePageSizeChange"
        class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option class="itbms-page-size" v-for="size in pageSizeOptions" :key="size" :value="size">
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
            @click="changePage(1)"
          >
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
