<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService } from '@/services'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'
import XButton from '@/components/common/XButton.vue'
import { useToastStore } from '@/stores/toast.store'

const route = useRoute()
const orderId = route.params.id
const order = ref(null)
const error = ref(null)
const router = useRouter()
const errorMessage = ref('')
const loading = ref(false)
const toast = useToastStore()

onMounted(async () => {
  loading.value = true
  const response = await OrderService.getOrderById(orderId)

  if (response.error) {
    loading.value = false
    error.value = true
    errorMessage.value = response.error || 'Failed to load order.'
    toast.add({
      title: 'Error',
      message: errorMessage.value,
      type: 'error'
    })
    return
  }

  order.value = response.data
  loading.value = false
})


const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Your Orders', path: '/your-orders' },
  { text: 'Order Details', path: '', active: true },
]
const goBackToOrders = () => {
  router.push('/your-orders')
}
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-6">Order Details</h1>

    <XButton
      class="mb-5"
      label=" ← Back to Orders"
      variant="outline"
      :leftIcon="ArrowLeft"
      @click="goBackToOrders"
    />

    <div v-if="error" class="text-red-600 text-center">{{ error }}</div>
    <OrderDetail v-else-if="order" :order="order" />
  </div>
</template>
