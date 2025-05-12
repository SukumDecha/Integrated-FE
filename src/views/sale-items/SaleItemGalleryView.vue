<script setup>
import { reactive, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import SaleItemCard from '@/components/sale-item/SaleItemCard.vue'
import { SaleItemService } from '@/services'
import XFooter from '@/components/layout/XFooter.vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const products = reactive([])

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', active: true },
]

const fetchProducts = async () => {
  const response = await SaleItemService.getAllSaleItems()
  if (response.error) {
    console.error('Error fetching products:', response.error)
    return
  }
  products.push(...response.data)
}

onMounted(async () => {
  await fetchProducts()
})

watchEffect(() => {
  if (route.query.toast === 'created') {
    toast.add({ message: 'The sale item has been successfully added.', type: 'success' })

    router.replace({ query: {} })
  }
})

</script>

<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <div class="bg-white flex-grow">
      <div class="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <div class="flex justify-between items-center">
          <XBreadcrumb :items="breadcrumbs" />
          <button
            @click="$router.push('/sale-items/add')"
            class="itbms-sale-item-add bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 whitespace-nowrap"
          >
            Add Sale Item
          </button>
        </div>

        <div class="space-y-2">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
          <p class="text-gray-500">Check out our most popular items this season.</p>
        </div>

        <div v-if="products.length > 0" class="mt-10">
          <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8">
            <SaleItemCard
              v-for="product in products"
              :key="product.id"
              :id="product.id"
              :brand="product.brandName"
              :model="product.model"
              :ramGb="product.ramGb"
              :storageGb="product.storageGb"
              :price="product.price"
            />
          </div>
        </div>

        <div v-else class="text-center py-10">
          <p class="text-lg text-gray-500">No sale items available.</p>
        </div>
      </div>
    </div>

    <XFooter :company-name="'Green Cart Inc.'" />
  </div>
</template>
