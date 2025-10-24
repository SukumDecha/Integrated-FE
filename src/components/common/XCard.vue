<script setup>
defineProps({
  title: {
    type: String,
    default: '',
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
  showHeader: {
    type: Boolean,
    default: true,
  },
  showStats: {
    type: Boolean,
    default: true,
  },
  headerGradient: {
    type: String,
    default: 'from-emerald-600 to-green-600',
  },
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
    <!-- Header with Gradient -->
    <div v-if="showHeader && (title || $slots.header)" :class="`bg-gradient-to-r ${headerGradient} px-8 py-6`">
      <slot name="header">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ title }}</h1>
            <p v-if="subtitle" class="text-emerald-100 text-sm">{{ subtitle }}</p>
          </div>
          <div v-if="buttons.length > 0" class="flex gap-3">
            <slot name="buttons" :buttons="buttons">
              <component
                v-for="(btn, index) in buttons"
                :key="index"
                :is="btn.component || 'button'"
                v-bind="btn.props || {}"
                @click="btn.onClick"
              >
                {{ btn.label }}
              </component>
            </slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Stats Bar -->
    <div
      v-if="showStats && stats.length > 0"
      class="bg-gradient-to-r from-slate-50 to-emerald-50 px-8 py-4 border-b border-slate-200"
    >
      <slot name="stats" :stats="stats">
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
      </slot>
    </div>

    <!-- Content -->
    <div class="p-8">
      <slot></slot>
    </div>
  </div>
</template>
