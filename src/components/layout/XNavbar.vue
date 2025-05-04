<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <ShoppingBag class="h-8 w-8 text-emerald-600" />
            <span class="ml-2 text-xl font-bold text-emerald-800">Green Cart</span>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a
              v-for="(item, index) in navItems"
              :key="index"
              :href="item.href"
              :class="[
                item.active
                  ? 'border-emerald-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-emerald-300 hover:text-gray-700',
                'inline-flex items-center px-1 pt-1 border-b-2 text-base md:text-lg font-medium',
              ]"
            >
              {{ item.name }}
            </a>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <button
            class="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Search class="h-6 w-6" />
          </button>
          <button
            class="ml-3 p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <User class="h-6 w-6" />
          </button>
          <button
            class="ml-3 p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative"
          >
            <ShoppingCart class="h-6 w-6" />
            <span
              v-if="cartCount > 0"
              class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-emerald-600 rounded-full"
            >
              {{ 0 }}
            </span>
          </button>
        </div>
        <div class="-mr-2 flex items-center sm:hidden">
          <button
            @click="isOpen = !isOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
          >
            <Menu v-if="!isOpen" class="block h-6 w-6" />
            <X v-else class="block h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="isOpen" class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <a
          v-for="(item, index) in navItems"
          :key="index"
          :href="item.href"
          :class="[
            item.active
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-emerald-300 hover:text-gray-700',
            'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
          ]"
        >
          {{ item.name }}
        </a>
      </div>
      <div class="pt-4 pb-3 border-t border-gray-200">
        <div class="flex items-center px-4">
          <div class="flex-shrink-0">
            <User class="h-10 w-10 text-gray-400" />
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800">{{ userName || 'Guest User' }}</div>
            <div class="text-sm font-medium text-gray-500">{{ userEmail || 'Sign in' }}</div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          <a
            v-for="(item, index) in userMenuItems"
            :key="index"
            :href="item.href"
            class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          >
            {{ item.name }}
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, defineProps } from 'vue'

defineProps({
  navItems: {
    type: Array,
    default: () => [
      { name: 'Home', href: '#', active: true },
      { name: 'Shop', href: '#', active: false },
      { name: 'Categories', href: '#', active: false },
      { name: 'About', href: '#', active: false },
    ],
  },
  userName: {
    type: String,
    default: '',
  },
  userEmail: {
    type: String,
    default: '',
  },
  userMenuItems: {
    type: Array,
    default: () => [
      { name: 'Your Profile', href: '#' },
      { name: 'Settings', href: '#' },
      { name: 'Sign out', href: '#' },
    ],
  },
})

const isOpen = ref(false)
</script>
