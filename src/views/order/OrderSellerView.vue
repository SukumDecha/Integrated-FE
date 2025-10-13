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
import XPagination from '@/components/common/XPagination.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToastStore()
const sellerId = authStore.user?.id

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
})

const activeTab = ref(OrderStatus.NEW)
const tabs = computed(() => [
  {
    label: `New (${orderCounts.value.new})`,
    value: OrderStatus.NEW,
  },
  {
    label: `Cancelled (${orderCounts.value.canceled})`,
    value: OrderStatus.CANCELED,
  },
  {
    label: `All (${orderCounts.value.all})`,
    value: OrderStatus.ALL,
  },
])

const orderCounts = ref({
  new: 0,
  canceled: 0,
  all: 0,
})

const orders = ref([])
const loading = reactive({ orders: true })
const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sales Orders', path: '/sale-orders', active: true },
]

const fetchAllTabsCounts = async () => {
  if (!sellerId) return

  try {
    // Fetch all orders count
    const allRes = await OrderService.getOrdersBySellerId(sellerId, {
      page: 0,
      size: 1,
      sortBy: 'createdOn',
      sortDirection: 'DESC',
      tab: 'ALL',
    })

    // Fetch new orders count
    const newRes = await OrderService.getOrdersBySellerId(sellerId, {
      page: 0,
      size: 1,
      sortBy: 'createdOn',
      sortDirection: 'DESC',
      tab: 'NEW',
    })

    // Fetch canceled orders count
    const canceledRes = await OrderService.getOrdersBySellerId(sellerId, {
      page: 0,
      size: 1,
      sortBy: 'createdOn',
      sortDirection: 'DESC',
      tab: 'CANCELLED',
    })

    orderCounts.value = {
      all: allRes?.pagination.totalItems || 0,
      new: newRes?.pagination.totalItems || 0,
      canceled: canceledRes?.pagination.totalItems || 0,
    }

    console.log('Order counts updated:', orderCounts.value)
  } catch (err) {
    console.error('Error fetching order counts:', err)
    toast.add({
      title: 'Error',
      message: 'Failed to load order counts.',
      type: 'error',
    })
  }
}

//โหลดออเดอร์ของสินค้าที่ seller เป็นเจ้าของ
const fetchOrders = async () => {
  loading.orders = true
  orders.value = [] // reset ก่อนเสมอ

  if (!sellerId) {
    loading.orders = false
    return
  }

  const params = {
    page: pagination.currentPage - 1,
    size: pagination.pageSize,
    sortBy: 'createdOn',
    sortDirection: 'DESC',
    tab: activeTab.value,
  }

  console.log('📡 Fetching Orders =>', params)
  const res = await OrderService.getOrdersBySellerId(sellerId, params)

  if (res?.data) {
    orders.value = res.data
    pagination.totalItems = res.pagination?.totalItems ?? res.totalElements ?? 0
  } else {
    toast.add({
      title: 'Error',
      message: res?.error || 'Failed to load orders.',
      type: 'error',
    })
  }

  loading.orders = false
}


// --- Pagination Change Handler ---
const handlePaginationChange = async ({ currentPage, pageSize }) => {
  if (
    currentPage === pagination.currentPage &&
    pageSize === pagination.pageSize
  ) return

  await router.push({
    query: {
      ...route.query,
      page: currentPage,
      size: pageSize,
    },
  })
}


const openOrderDetail = (order) => {
  router.push(`/sale-orders/${order.id}`)
}

onMounted(async () => {
  await fetchAllTabsCounts() // โหลดแค่ count
})

// โหลดใหม่เมื่อ activeTab เปลี่ยน
watch(activeTab, () => {
  pagination.currentPage = 1
  fetchOrders()
})

watch(
  () => route.fullPath,
  async (newPath) => {
    console.log('🔄 Route changed to', newPath)
    const q = route.query
    pagination.currentPage = parseInt(q.page) || 1
    pagination.pageSize = parseInt(q.size) || pagination.pageSize
    await fetchOrders()
  },
  { immediate: true }
)

onMounted(() => {
  pagination.currentPage = 1
  pagination.pageSize = 10
  orders.value = []
})
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <XBreadcrumb :items="breadcrumbs" class="mb-6" />

    <XTab v-model="activeTab" :tabs="tabs" class="mb-6" />

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
    <XPagination
      v-if="orders.length > 0"
      class="mt-10"
      :pagination="{
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        total: pagination.totalItems,
      }"
      :show-size-changer="true"
      @change="handlePaginationChange"
    />
  </div>
</template>
