<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XTab from '@/components/common/XTab.vue'
import OrderCard from '@/components/order/OrderCard.vue'
import { OrderService } from '@/services'
import { OrderStatus } from '@/constants/order.constant.js'
import { useToastStore } from '@/stores/toast.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const sellerId = authStore.user?.id

const activeTab = ref(OrderStatus.NEW)
const tabs = computed(() => [
  {
    label: `New (${
      orders.value.filter(
        (o) =>
          !o.isViewed &&
          (o.orderStatus === OrderStatus.NEW || o.orderStatus === OrderStatus.COMPLETED),
      ).length
    })`,
    value: OrderStatus.NEW,
  },
  {
    label: `Canceled (${orders.value.filter((o) => o.orderStatus === OrderStatus.CANCELED).length})`,
    value: OrderStatus.CANCELED,
  },
  {
    label: `All (${orders.value.length})`,
    value: OrderStatus.ALL,
  },
])

const orders = ref([])
const loading = reactive({ orders: true })
const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sales Orders', path: '/sale-orders', active: true },
]

//โหลดออเดอร์ของสินค้าที่ seller เป็นเจ้าของ
const fetchOrders = async () => {
  loading.orders = true

  const res = await OrderService.getOrdersBySellerId(sellerId, {
    tab: activeTab.value.toLowerCase(),
  })

  if (res?.data) {
    //เรียงลำดับแบบ fallback: ใช้ orderNo → createdAt → orderDate
    orders.value = res.data.sort((a, b) => {
      // ลองใช้ orderNo ก่อน ถ้ามี
      if (a.orderNo && b.orderNo) {
        return b.orderNo - a.orderNo
      }
      // ถ้าไม่มี orderNo ใช้ createdAt หรือ orderDate
      const aDate = new Date(a.createdAt || a.orderDate)
      const bDate = new Date(b.createdAt || b.orderDate)
      return bDate.getTime() - aDate.getTime()
    })
  } else {
    toast.add({
      title: 'Error',
      message: res?.error || 'Failed to load orders.',
      type: 'error',
    })
  }

  loading.orders = false
}


const openOrderDetail = (order) => {
  router.push(`/sale-orders/${order.id}`)
}

onMounted(fetchOrders)
// โหลดใหม่เมื่อ path เปลี่ยน
watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath.includes('/sale-orders')) {
      fetchOrders()
    }
  },
)
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-4">Sales Orders</h1>

    <XTab v-model="activeTab" :tabs="tabs" class="mb-6" @change="fetchOrders" />

    <div v-if="loading.orders" class="text-center py-20 text-gray-500">Loading orders...</div>

    <div v-else>
      <OrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        :isBuyerCard="false"
        @click="openOrderDetail(order)"
      />

      <div v-if="!orders.length" class="text-center text-gray-500 py-20">
        You don’t have any {{ activeTab }} orders.
      </div>
    </div>
  </div>
</template>
