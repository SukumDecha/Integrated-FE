<script setup>
import { ref, onMounted } from 'vue'
import { useRoute , useRouter } from 'vue-router'
import { OrderService } from '@/services'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import OrderDetail from '@/components/order/OrderDetail.vue'
import { useToastStore } from '@/stores/toast.store'
import XButton from '@/components/common/XButton.vue'

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Orders', path: '/sale-orders' ,class: 'itbms-sale-orders-button'},
  { text: `Order Detail`, active: true },
]

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const order = ref(null)
const loading = ref(true)
const error = ref(null)
const errorMessage = ref('')
const toast = useToastStore()

// โหลดข้อมูลออเดอร์
const fetchOrderDetail = async () => {
  loading.value = true

  const res = await OrderService.getOrderById(orderId)
  loading.value = false

  if (res?.error) {
    error.value = true
    errorMessage.value = res.error || 'Failed to load order.'
    toast.add({
      title: 'Error',
      message: errorMessage.value,
      type: 'error',
    })
    return
  }

  if (res?.data) {
    order.value = res.data
    error.value = null
  } else {
    error.value = true
    errorMessage.value = 'Order not found.'
    toast.add({
      title: 'Error',
      message: errorMessage.value,
      type: 'error',
    })
  }
}

onMounted(fetchOrderDetail)
const goBackToOrders = () => {
  router.push('/sale-orders')
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <XBreadcrumb :items="breadcrumbs" class="mb-6" />
     <h1 class="text-2xl font-semibold text-green-700 mb-6">Order Details</h1>
     <XButton
      class="mb-5"
      label=" ← Back to Orders"
      variant="outline"
      :leftIcon="ArrowLeft"
      @click="goBackToOrders"
    />
    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-red-500 py-10">
      {{ error }}
    </div>

    <div v-else-if="order">
      <OrderDetail :order="order" />
    </div>
  </div>
</template>
