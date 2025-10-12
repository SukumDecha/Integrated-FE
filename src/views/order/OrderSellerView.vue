<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XTab from '@/components/common/XTab.vue'
import OrderCard from '@/components/order/OrderCard.vue'
import { OrderService } from '@/services'
import { OrderStatus } from '@/constants/order.constant.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sellerId = authStore.user?.id

const activeTab = ref('new')
const tabs = computed(() => [
  {
    label: `New (${orders.value.filter(
      o =>
        !o.isViewed &&
        (o.orderStatus === OrderStatus.NEW || o.orderStatus === OrderStatus.COMPLETED)
    ).length})`,
    value: 'new',
  },
  {
    label: `Canceled (${orders.value.filter(o => o.orderStatus === OrderStatus.CANCELED).length})`,
    value: 'canceled',
  },
  {
    label: `All (${orders.value.length})`,
    value: 'all',
  },
])


const orders = ref([])
const loading = reactive({ orders: true })
const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sales Orders', path: '/sale-orders', active: true },
]

const fetchOrders = async () => {
  loading.orders = true
  const res = await OrderService.getOrdersBySellerId(sellerId)
  const data = res?.data || []

  // ✅ อ่านรายการที่ดูแล้วจาก localStorage
  const viewedOrders = JSON.parse(localStorage.getItem('viewedOrders') || '[]')

  // ✅ mark order ที่เคยดูไว้
  orders.value = data.map(o => ({
    ...o,
    isViewed: viewedOrders.includes(o.id)
  }))

  loading.orders = false
}


//กรองออเดอร์ตามแท็บ
const filteredOrders = computed(() => {
  if (activeTab.value === 'new')
    return orders.value.filter(
      (o) =>
        !o.isViewed &&
        (o.orderStatus === OrderStatus.NEW || o.orderStatus === OrderStatus.COMPLETED),
    )
  if (activeTab.value === 'canceled')
    return orders.value.filter((o) => o.orderStatus === OrderStatus.CANCELED)
  return orders.value
})

const openOrderDetail = (order) => {
  // ✅ ดึงรายการ orderId ที่เคยดูมาแล้ว
  const viewedOrders = JSON.parse(localStorage.getItem('viewedOrders') || '[]')

  // ✅ ถ้ายังไม่มี id นี้ → เพิ่มเข้าไป
  if (!viewedOrders.includes(order.id)) {
    viewedOrders.push(order.id)
    localStorage.setItem('viewedOrders', JSON.stringify(viewedOrders))
  }

  // ✅ ไปหน้า detail
  router.push(`/sale-orders/${order.id}`)
}
onMounted(fetchOrders)
watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath.includes('/sale-orders')) {
      fetchOrders()
    }
  }
)
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-4">Sales Orders</h1>

    <XTab v-model="activeTab" :tabs="tabs" class="mb-6" />

    <div v-if="loading.orders" class="text-center py-20 text-gray-500">Loading orders...</div>

    <div v-else>
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        :isBuyerCard="false"
        @click="openOrderDetail(order)"
      />

      <div v-if="!filteredOrders.length" class="text-center text-gray-500 py-20">
        You don’t have any {{ activeTab }} orders.
      </div>
    </div>
  </div>
</template>
