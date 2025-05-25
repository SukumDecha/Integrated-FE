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
      <tbody v-if="data.length > 0" class="divide-y divide-gray-200">
        <tr
          v-for="(row, rowIndex) in data"
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
  <XPagination
    v-if="pagination"
    :pagination="pagination"
    :data="data"
    :page-size-options="pageSizeOptions"
    :show-size-changer="showSizeChanger"
    @change="handlePaginationChange"
  />
</template>

<script setup>
import XPagination from './XPagination.vue';

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  pagination: {
    type: Object,
    default: null
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
    default: 10
  }
});

const emit = defineEmits(['change']);

function handlePaginationChange({
  currentPage,
  pageSize
}) {
  const newPagination = {
    ...props.pagination,
    currentPage,
    pageSize
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

</script>
