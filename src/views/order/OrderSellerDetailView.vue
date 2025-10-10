<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderService } from '@/services'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'

const route = useRoute()
const router = useRouter()

const orderId = route.params.id
const order = ref(null)
const loading = ref(true)
const error = ref(null)

// 🔹 Format helper
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const formatCurrency = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'

// 🔹 รวมราคา
const calculateTotal = computed(() =>
  order.value?.orderItems?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0)
)

// 🔹 โหลดข้อมูลออเดอร์
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const res = await OrderService.getOrderById(orderId)
    if (res?.data) {
      order.value = res.data
      // mark ว่าดูแล้ว
      await OrderService.markOrderAsViewed(orderId)
    } else {
      error.value = 'Order not found.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to load order detail.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrderDetail)
</script>

<template>
  <XBreadcrumb :items="[{ text: 'Home', path: '/' }, { text: 'Sales Orders', path: '/sale-orders' }, { text: `Order #${orderId}`, active: true }]" />

  <div class="max-w-5xl mx-auto p-6">
    <h1 class="text-2xl font-semibold text-green-700 mb-6">Sales Order Detail</h1>

    <div v-if="loading" class="text-center text-gray-500 py-10">Loading...</div>

    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>

    <div v-else-if="order" class="border border-green-200 rounded-lg p-6 bg-green-50">
      <!-- Header -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p><span class="font-semibold">Order No:</span> {{ order.id }}</p>
          <p><span class="font-semibold">Order Date:</span> {{ formatDate(order.orderDate) }}</p>
          <p><span class="font-semibold">Total:</span> {{ formatCurrency(calculateTotal) }}</p>
          <p><span class="font-semibold">Shipping Address:</span> {{ order.shippingAddress }}</p>
        </div>
        <div>
          <p><span class="font-semibold">Buyer:</span> {{ order.buyer?.nickname || 'Unknown Buyer' }}</p>
          <p><span class="font-semibold">Payment Date:</span> {{ formatDate(order.orderDate) }}</p>
          <p>
            <span class="font-semibold">Status:</span>
            <span
              class="px-2 py-1 rounded-full text-xs font-semibold uppercase ml-1"
              :class="{
                'bg-yellow-100 text-yellow-800': order.orderStatus === 'NEW',
                'bg-red-100 text-red-700': order.orderStatus === 'CANCELED',
                'bg-green-100 text-green-700': order.orderStatus === 'COMPLETED'
              }"
            >
              {{ order.orderStatus }}
            </span>
          </p>
          <p v-if="order.orderNote"><span class="font-semibold">Note:</span> {{ order.orderNote }}</p>
        </div>
      </div>

      <!-- Items -->
      <div class="space-y-3">
        <div
          v-for="item in order.orderItems"
          :key="item.id"
          class="flex justify-between items-center border border-green-100 rounded-md p-3 bg-white"
        >
          <div class="text-gray-800">
            {{ item.description }}
          </div>
          <div class="text-right text-sm">
            <div class="text-gray-600">Qty {{ item.quantity }}</div>
            <div class="text-gray-600">Unit Price: {{ formatCurrency(item.price) }}</div>
            <div class="font-medium text-green-700">
              Price: {{ formatCurrency(item.price * item.quantity) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-right">
        <button
          @click="router.push('/sale-orders')"
          class="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
        >
          ← Back to Orders
        </button>
      </div>
    </div>
  </div>
</template>
