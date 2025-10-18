<script setup>
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'
import XPagination from '@/components/common/XPagination.vue'

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
  <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
    <!-- Header with Gradient -->
    <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">{{ title }}</h1>
          <p v-if="subtitle" class="text-emerald-100 text-sm">{{ subtitle }}</p>
        </div>
        <div v-if="buttons.length > 0" class="flex gap-3">
          <XButton
            v-for="(btn, index) in buttons"
            :key="index"
            :label="btn.label"
            :variant="btn.variant || 'outline'"
            :size="btn.size || 'md'"
            :class-name="btn.className"
            @click="btn.onClick"
          />
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div
      v-if="stats.length > 0"
      class="bg-gradient-to-r from-slate-50 to-emerald-50 px-8 py-4 border-b border-slate-200"
    >
      <div class="flex items-center gap-6">
        <template v-for="(stat, index) in stats" :key="index">
          <div class="flex items-center gap-2">
            <div v-if="stat.showPulse" class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <component v-if="stat.icon" :is="stat.icon" class="w-4 h-4 text-emerald-600" />
            <span class="text-sm text-slate-600" v-html="stat.label"></span>
          </div>
          <div v-if="index < stats.length - 1" class="w-px h-4 bg-slate-300"></div>
        </template>
      </div>
    </div>

    <!-- Table Container -->
    <div class="p-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block">
          <div
            class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"
          ></div>
          <p class="mt-4 text-slate-600 font-medium">{{ loadingText }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="showEmptyState && data.length === 0" class="text-center py-16">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
          <component v-if="emptyStateIcon" :is="emptyStateIcon" class="w-10 h-10 text-emerald-600" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ emptyStateTitle }}</h3>
        <p class="text-slate-500 mb-6">{{ emptyStateDescription }}</p>
        <XButton
          :label="emptyStateButtonLabel"
          variant="primary"
          size="md"
          class-name="itbms-add-button bg-emerald-600 hover:bg-emerald-700 text-white"
          @click="handleEmptyAction"
        />
      </div>

      <!-- Table -->
      <div v-else class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <XTable
          :columns="columns"
          :data="data"
          :empty-text="emptyText"
        >
          <!-- Pass through all slots -->
          <template v-for="(_, slot) in $slots" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </XTable>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && data.length > 0 && pagination" class="mt-8">
        <XPagination
          :pagination="pagination"
          :show-size-changer="showSizeChanger"
          @change="handlePaginationChange"
        />
      </div>
    </div>
  </div>
</template>
