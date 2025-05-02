<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <XNavbar :brand-name="storeName" :cart-count="cartCount" />

    <!-- Featured Products -->
    <div class="bg-white">
      <div class="max-w-2xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:max-w-7xl lg:px-8 space-y-6">
        <XBreadcrumb :items="breadcrumbs" />

        <div class="space-y-2">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
          <p class="text-gray-500">Check out our most popular items this season.</p>
        </div>

        <div v-if="products.length && products.length > 0" class="mt-10">
          <div
            class="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8"
          >
            <SaleItemCard
              v-for="product in products"
              :key="product.id"
              :brand="product.brand"
              :model="product.model"
              :ramGb="product.ramGb"
              :storageGb="product.storageGb"
              :price="product.price"
            />
          </div>
        </div>

        <div v-else class="text-center py-10">
          <p class="itbms-* text-lg text-gray-500">no sale item</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer :company-name="storeName" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import SaleItemCard from '@/components/sale-item/SaleItemCard.vue'
import SaleItemService from '@/services/sale-item.service'

// Store data
const storeName = ref('GreenCart')
const cartCount = ref(3)

const products = reactive([])

const breadcrumbs = [
  { text: 'Home', to: '/' },
  { text: 'Sale Items', active: true },
]

const fetchProducts = async () => {
  try {
    const allItems = await SaleItemService.getAllSaleItems()
    products.push(...allItems)
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
