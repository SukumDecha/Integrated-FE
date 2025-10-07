<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { OrderService } from '@/services'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'

const route = useRoute()
const orderId = route.params.id
const order = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await OrderService.getOrderById(orderId)
    order.value = response.data
  } catch (err) {
    error.value = err.message || 'Failed to load order.'
  }
})

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Your Orders', path: '/your-orders' },
  { text: 'Order Details', path: '', active: true }
]
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-6">Order Details</h1>

    <div v-if="error" class="text-red-600 text-center">{{ error }}</div>
    <OrderDetail v-else-if="order" :order="order" />
  </div>
</template>
