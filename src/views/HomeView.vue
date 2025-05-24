<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <XNavbar :brand-name="storeName" />

    <!-- Hero Section -->
    <HeroSection
      title="Spring Collection"
      subtitle="Discover our new eco-friendly collection. Sustainable fashion that doesn't compromise on style or comfort."
      primary-button-text="Shop Now"
      secondary-button-text="Learn More"
    />

    <!-- Featured Products -->
    <div class="bg-white">
      <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
        <p class="mt-4 text-gray-500">Check out our most popular items this season.</p>

        <div
          class="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8"
        >
          <SaleItemCard
            v-for="product in products"
            :id="product.id"
            :key="product.id"
            :brand="product.brandName"
            :model="product.model"
            :ramGb="product.ramGb"
            :storageGb="product.storageGb"
            :price="product.price"
            :is-loading="loading"
            :error="error"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <XFooter :company-name="storeName" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import SaleItemCard from '@/components/sale-item/SaleItemCard.vue'
import { SaleItemService } from '@/services'
import XFooter from '@/components/layout/XFooter.vue'

// Store data
const storeName = ref('GreenCart')

const products = ref([])
const loading = ref(true)
const error = ref(null)

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await SaleItemService.getAllSaleItems()
    products.value = response.data
  } catch (error) {
    console.error('Error fetching products:', error)
    error.value = 'Failed to load products. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
