<template>
  <div class="relative bg-white overflow-hidden h-screen flex items-center">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-[0.02]">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(5 150 105) 1px, transparent 0); background-size: 40px 40px;"></div>
    </div>

    <!-- Background Image - Right Side -->
    <div class="absolute right-0 top-0 bottom-0 w-full lg:w-1/2">
      <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10"></div>
      <img
        class="w-full h-full object-cover"
        :src="backgroundImage"
        :alt="title"
      >
    </div>

    <!-- Content Container -->
    <div class="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div class="flex items-center h-full">
        <!-- Left Content -->
        <div class="w-full lg:w-1/2 space-y-5">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50">
            <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            <span class="text-xs font-semibold text-emerald-700">New Arrival</span>
          </div>

          <!-- Title -->
          <div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-3 leading-[1.1]">
              {{ title }}
            </h1>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 leading-[1.1]">
              Latest Smartphones
            </h2>
          </div>

          <!-- Subtitle -->
          <p class="text-base lg:text-lg text-gray-600 max-w-xl leading-relaxed">
            {{ subtitle }}
          </p>

          <!-- Feature Pills -->
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700">
              <svg class="w-3.5 h-3.5 mr-1.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Free Shipping
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700">
              <svg class="w-3.5 h-3.5 mr-1.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Warranty Included
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-700">
              <svg class="w-3.5 h-3.5 mr-1.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              Best Price
            </span>
          </div>

          <!-- Buttons -->
          <div class="flex flex-wrap gap-3">
            <XButton
              :label="primaryButtonText"
              variant="primary"
              size="lg"
              class="itbms-shopnow shadow-lg hover:shadow-xl"
              @click="onClickPrimaryButton"
            >
              <template #default>
                <span class="flex items-center">
                  {{ primaryButtonText }}
                  <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </span>
              </template>
            </XButton>

            <XButton
              v-if="secondaryButtonText"
              :label="secondaryButtonText"
              variant="outline"
              size="lg"
              @click="onClickSecondaryButton"
            />
          </div>

          <!-- Stats -->
          <div class="flex gap-8 pt-5 border-t border-gray-200">
            <div>
              <div class="text-3xl font-black text-gray-900">500+</div>
              <div class="text-xs text-gray-500 mt-0.5">Models</div>
            </div>
            <div>
              <div class="text-3xl font-black text-gray-900">50K+</div>
              <div class="text-xs text-gray-500 mt-0.5">Customers</div>
            </div>
            <div>
              <div class="text-3xl font-black text-emerald-600">4.9★</div>
              <div class="text-xs text-gray-500 mt-0.5">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/3 left-1/4 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import XButton from '@/components/common/XButton.vue'

const router = useRouter()

const backgroundImage = 'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'

const props = defineProps({
  title: {
    type: String,
    default: 'Investigate',
  },
  subtitle: {
    type: String,
    default:
      'Explore our premium collection of the latest smartphones with cutting-edge technology, stunning designs, and unbeatable prices. Find your perfect device today.',
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

const onClickPrimaryButton = () => {
  router.push(props.primaryButtonLink)
}

const onClickSecondaryButton = () => {
  if (props.secondaryButtonLink) {
    router.push(props.secondaryButtonLink)
  }
}
</script>
