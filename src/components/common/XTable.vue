<template>
  <div>
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
        <tbody
          v-if="data && data.length > 0"
          class="divide-y divide-gray-200"
        >
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

        <!-- ✅ ถ้าไม่มีข้อมูล -->
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

    <!-- ✅ Pagination (ถ้ามี) -->
    <XPagination
      v-if="pagination"
      :pagination="pagination"
      :show-size-changer="showSizeChanger"
      @change="handlePaginationChange"
    />
  </div>
</template>

<script setup>
import XPagination from './XPagination.vue';

defineProps({
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
  showSizeChanger: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['change']);

function handlePaginationChange({ currentPage, pageSize }) {
  emit('change', { currentPage, pageSize });
}

function getAlignmentClass(align) {
  switch (align) {
    case 'right':
      return 'text-right';
    case 'center':
      return 'text-center';
    case 'left':
    default:
      return 'text-left';
  }
}

function getWidthStyle(width) {
  return width ? { width } : {};
}
</script>
