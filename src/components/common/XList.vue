<script setup>
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'
import XPagination from '@/components/common/XPagination.vue'
import XCard from '@/components/common/XCard.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  buttons: {
    type: Array,
    default: () => [],
  },
  stats: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: 'Loading...',
  },
  emptyText: {
    type: String,
    default: 'No data found',
  },
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  pagination: {
    type: Object,
    default: null,
  },
  showSizeChanger: {
    type: Boolean,
    default: false,
  },
  showEmptyState: {
    type: Boolean,
    default: false,
  },
  emptyStateIcon: {
    type: Object,
    default: null,
  },
  emptyStateTitle: {
    type: String,
    default: 'No items yet',
  },
  emptyStateDescription: {
    type: String,
    default: 'Get started by adding your first item',
  },
  emptyStateButtonLabel: {
    type: String,
    default: 'Add First Item',
  },
})

const emit = defineEmits(['pagination-change', 'empty-action'])

function handlePaginationChange(payload) {
  emit('pagination-change', payload)
}

function handleEmptyAction() {
  emit('empty-action')
}
</script>

<template>
  <XCard
    :title="title"
    :subtitle="subtitle"
    :buttons="buttons"
    :stats="stats"
  >
    <!-- Custom buttons slot if needed -->
    <template #buttons="{ buttons: cardBtns }">
      <XButton
        v-for="(btn, index) in cardBtns"
        :key="index"
        :label="btn.label"
        :variant="btn.variant || 'outline'"
        :size="btn.size || 'md'"
        :class-name="btn.className"
        @click="btn.onClick"
      />
    </template>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="text-center py-16"
    >
      <div class="inline-block">
        <div
          class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"
        />
        <p class="mt-4 text-slate-600 font-medium">
          {{ loadingText }}
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="showEmptyState && data.length === 0"
      class="text-center py-16"
    >
      <div
        class="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4"
      >
        <component
          :is="emptyStateIcon"
          v-if="emptyStateIcon"
          class="w-10 h-10 text-emerald-600"
        />
      </div>
      <h3 class="text-xl font-semibold text-slate-800 mb-2">
        {{ emptyStateTitle }}
      </h3>
      <p class="text-slate-500 mb-6">
        {{ emptyStateDescription }}
      </p>
      <XButton
        :label="emptyStateButtonLabel"
        variant="primary"
        size="md"
        class-name="itbms-add-button bg-emerald-600 hover:bg-emerald-700 text-white"
        @click="handleEmptyAction"
      />
    </div>

    <!-- Table -->
    <div
      v-else
      class="overflow-hidden rounded-xl border border-slate-200 shadow-sm"
    >
      <XTable
        :columns="columns"
        :data="data"
        :empty-text="emptyText"
      >
        <!-- Pass through all slots -->
        <template
          v-for="(_, slot) in $slots"
          #[slot]="scope"
        >
          <slot
            :name="slot"
            v-bind="scope"
          />
        </template>
      </XTable>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && data.length > 0 && pagination"
      class="mt-8"
    >
      <XPagination
        :pagination="pagination"
        :show-size-changer="showSizeChanger"
        @change="handlePaginationChange"
      />
    </div>
  </XCard>
</template>
