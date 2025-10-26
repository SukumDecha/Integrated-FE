<script setup>
import { defineProps } from 'vue'
import { Home as HomeIcon, ChevronRight as ChevronRightIcon } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    required: true,
    validator: (items) => {
      return items.every((item) => item.text !== undefined)
    },
  },
  showHomeIcon: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: [String, Object],
    default: 'chevron',
  },
})
</script>

<template>
  <nav
    aria-label="Breadcrumb"
    class="w-full"
  >
    <ol class="flex flex-wrap items-center text-base md:text-lg">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center"
        :class="{
          'text-gray-500': index !== items.length - 1,
          'text-gray-700 font-medium': index === items.length - 1,
        }"
      >
        <component
          :is="HomeIcon"
          v-if="index === 0 && showHomeIcon"
          class="h-4 w-4 mr-1"
          :class="{ 'text-emerald-600': !item.active }"
        />

        <router-link
          v-if="!item.active && item.path"
          :to="index === 0 ? '/' : item.path"
          :class="[
            'hover:text-emerald-600 transition-colors',
            index === 0 ? 'itbms-home-button' : '',
            index === 0 && !showHomeIcon ? 'text-emerald-600' : '',
          ]"
        >
          {{ item.text }}
        </router-link>

        <a
          v-else-if="!item.active && item.href"
          :href="item.href"
          class="hover:text-emerald-600 transition-colors"
          :class="{ 'text-emerald-600': index === 0 && !showHomeIcon }"
        >
          {{ item.text }}
        </a>

        <span v-else>{{ item.text }}</span>

        <span
          v-if="index < items.length - 1"
          class="mx-2 text-gray-400"
          aria-hidden="true"
        >
          <component
            :is="separator === 'chevron' ? ChevronRightIcon : separator"
            class="h-4 w-4"
          />
        </span>
      </li>
    </ol>
  </nav>
</template>
