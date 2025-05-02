<template>
  <footer class="bg-gray-800">
    <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
      <nav class="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
        <div v-for="(item, index) in footerLinks" :key="index" class="px-5 py-2">
          <a :href="item.href" class="text-base text-gray-300 hover:text-white">
            {{ item.name }}
          </a>
        </div>
      </nav>
      <div class="mt-8 flex justify-center space-x-6">
        <a
          v-for="(social, index) in socialLinks"
          :key="index"
          :href="social.href"
          class="text-gray-400 hover:text-gray-300"
        >
          <span class="sr-only">{{ social.name }}</span>
          <component :is="social.icon" class="h-6 w-6" />
        </a>
      </div>
      <p class="mt-8 text-center text-base text-gray-400">
        &copy; {{ new Date().getFullYear() }} {{ companyName }}, Inc. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { defineProps } from 'vue'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-vue-next'

defineProps({
  companyName: {
    type: String,
    default: 'GreenCart',
  },
  footerLinks: {
    type: Array,
    default: () => [
      { name: 'Home', href: '#' },
      { name: 'Shop', href: '#' },
      { name: 'Categories', href: '#' },
      { name: 'About', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Blog', href: '#' },
    ],
  },
  socialLinks: {
    type: Array,
    default: () => [
      { name: 'Facebook', href: '#', icon: Facebook },
      { name: 'Instagram', href: '#', icon: Instagram },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: 'YouTube', href: '#', icon: Youtube },
    ],
  },
})
</script>
