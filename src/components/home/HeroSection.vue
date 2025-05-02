<template>
  <div class="relative bg-emerald-700">
    <div class="absolute inset-0">
      <img class="w-full h-full object-cover" :src="backgroundImage" :alt="title" />
      <div class="absolute inset-0 bg-emerald-700 mix-blend-multiply" aria-hidden="true"></div>
    </div>
    <div class="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {{ title }}
      </h1>
      <p class="mt-6 text-xl text-emerald-100 max-w-3xl">{{ subtitle }}</p>
      <div class="mt-10">
        <a
          :href="primaryButtonLink"
          class="inline-block bg-white py-3 px-8 border border-transparent rounded-md text-base font-medium text-emerald-700 hover:bg-emerald-50 itbms-shopnow"
        >
          {{ primaryButtonText }}
        </a>
        <a
          v-if="secondaryButtonText"
          :href="secondaryButtonLink"
          class="inline-block ml-4 py-3 px-8 border border-transparent rounded-md text-base font-medium text-white hover:bg-emerald-800 bg-emerald-600"
        >
          {{ secondaryButtonText }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  backgroundImage: {
    type: String,
    default:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  title: {
    type: String,
    default: 'Spring Collection',
  },
  subtitle: {
    type: String,
    default:
      "Discover our new eco-friendly collection. Sustainable fashion that doesn't compromise on style or comfort.",
  },
  primaryButtonText: {
    type: String,
    default: 'Shop Now',
  },
  primaryButtonLink: {
    type: String,
    default: '/sale-items',
  },
  secondaryButtonText: {
    type: String,
    default: 'Learn More',
  },
  secondaryButtonLink: {
    type: String,
    default: '#',
  },
})
</script>
