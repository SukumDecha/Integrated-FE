<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XTab from '@/components/common/XTab.vue'
import OrderCardSeller from '@/components/order/OrderCardSeller.vue' // 👈 เพิ่มใหม่
import { OrderService } from '@/services'

const router = useRouter()
const authStore = useAuthStore()
const sellerId = authStore.user?.id

const activeTab = ref('new')
const tabs = [
  { label: 'New', value: 'new' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'All', value: 'all' },
]

const orders = ref([])
const loading = reactive({ orders: true })
const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sales Orders', path: '/sale-orders', active: true },
]

//โหลดออเดอร์ของสินค้าที่ seller เป็นเจ้าของ
const fetchOrders = async () => {
  loading.orders = true
  const res = await OrderService.getOrdersBySellerId(sellerId)
  orders.value = res?.data || []
  loading.orders = false
}

//กรองออเดอร์ตามแท็บ
const filteredOrders = computed(() => {
  if (activeTab.value === 'new') return orders.value.filter(o => !o.isViewed && o.orderStatus === 'NEW')
  if (activeTab.value === 'canceled') return orders.value.filter(o => o.orderStatus === 'CANCELED')
  return orders.value.filter(o => o.orderStatus === 'COMPLETED')
})

//เปิดดูรายละเอียดออเดอร์
const openOrderDetail = (order) => {
  router.push(`/sale-orders/${order.id}`)
}

onMounted(fetchOrders)
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-4">Sales Orders</h1>

    <XTab v-model="activeTab" :tabs="tabs" class="mb-6" />

    <div v-if="loading.orders" class="text-center py-20 text-gray-500">
      Loading orders...
    </div>

    <div v-else>
      <OrderCardSeller
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @click="openOrderDetail(order)"
      />

      <div v-if="!filteredOrders.length" class="text-center text-gray-500 py-20">
        You don’t have any {{ activeTab }} orders.
      </div>
    </div>
  </div>
</template>
