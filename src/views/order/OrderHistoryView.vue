<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XPagination from '@/components/common/XPagination.vue'
import OrderCard from '@/components/order/OrderCard.vue'
import { useToastStore } from '@/stores/toast.store'
import { useAuthStore } from '@/stores/auth.store'
import { OrderService } from '@/services'
import { loadFromSessionStorage, saveToSessionStorage } from '@/utils/StorageUtils'
import XTab from '@/components/common/XTab.vue'
import { OrderStatus } from '@/constants/order.constant.js'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()
const authStore = useAuthStore()

const ORDER_STORAGE_KEYS = {
  PAGINATION: 'ORDER_HISTORY_PAGINATION',
  SORT: 'ORDER_HISTORY_SORT',
}

const orders = ref([])

const loading = reactive({ orders: true })
const error = reactive({ orders: null })

const searchOptions = reactive({
  currentPage: 1,
  pageSize: 10,
  totalElements: 0,
  sortBy: 'orderDate',
  sortOrder: 'desc',
})

const searchParams = computed(() => ({
  page: searchOptions.currentPage - 1,
  size: searchOptions.pageSize,
  sortBy: searchOptions.sortBy,
  sortDirection: searchOptions.sortOrder,
}))

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Your Orders', path: '/your-orders', active: true },
]

const initializeState = () => {
  const q = route.query
  const storedPage = loadFromSessionStorage(ORDER_STORAGE_KEYS.PAGINATION, {})
  const storedSort = loadFromSessionStorage(ORDER_STORAGE_KEYS.SORT, {})
  router.replace({ query: {} }) // เคลียร์ค่าค้างใน URL

  searchOptions.currentPage = parseInt(q.page) || storedPage.currentPage || 1
  searchOptions.pageSize = parseInt(q.size) || storedPage.pageSize || 10
  searchOptions.sortBy = q.sortBy || storedSort.field || 'orderDate'
  searchOptions.sortOrder = q.sortDirection || storedSort.order || 'desc'
  updateRouteQuery()
}

const updateRouteQuery = () => {
  router.replace({ query: { ...searchParams.value, page: searchOptions.currentPage } })
}

const fetchOrders = async () => {
  const userId = authStore.user?.id
  if (!userId) return

  loading.orders = true
  error.orders = null

  const response = await OrderService.getOrderByUserId(userId, searchParams.value)

  if (response.error) {
    error.orders = response.error || 'Failed to load order history.'
    toast.add({ type: 'error', message: error.orders })
  } else {
    orders.value = response.data || []

    searchOptions.totalElements = response.data?.totalElements || 0
  }
  loading.orders = false
}

const handlePaginationChange = async ({ currentPage, pageSize }) => {
  const oldPage = searchOptions.currentPage
  searchOptions.currentPage = currentPage
  searchOptions.pageSize = pageSize

  if (oldPage !== currentPage) await fetchOrders()

  saveToSessionStorage(ORDER_STORAGE_KEYS.PAGINATION, { currentPage, pageSize })
}

onMounted(async () => {
  initializeState()
  await fetchOrders()
})

watch(
  () => [
    searchOptions.currentPage,
    searchOptions.pageSize,
    searchOptions.sortBy,
    searchOptions.sortOrder,
  ],
  updateRouteQuery,
)
const activeTab = ref('completed')

const filteredOrders = computed(() => {
  if (activeTab.value === 'completed') {
    return orders.value.filter((o) => o.orderStatus === OrderStatus.COMPLETED)
  } else if (activeTab.value === 'canceled') {
    return orders.value.filter((o) => o.orderStatus === OrderStatus.CANCELED)
  }
  return orders.value
})

const groupedFilteredOrders = computed(() => {
  return filteredOrders.value.reduce((acc, order) => {
    const seller = order.seller?.nickname || 'Unknown'
    if (!acc[seller]) acc[seller] = []
    acc[seller].push(order)
    return acc
  }, {})
})
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-6">Your Orders</h1>
    <XTab
      v-model="activeTab"
      :tabs="[
        { label: 'Completed', value: 'completed' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'All', value: 'all' },
      ]"
      class="mb-6"
    />
    <div>
      <div
        v-for="(sellerOrders, sellerName) in groupedFilteredOrders"
        :key="sellerName"
        class="space-y-6"
      >
        <OrderCard
          v-for="order in sellerOrders"
          :key="order.id"
          :order="order"
          :isBuyerCard="true"
        />
      </div>
    </div>
    <div
      v-if="!loading.orders && !filteredOrders.length && !error.orders"
      class="text-center text-gray-500 text-lg py-20"
    >
      You don’t have any {{ activeTab }} orders.
    </div>

    <XPagination
      v-if="!loading.orders && orders.length"
      class="mt-10"
      :pagination="{
        currentPage: searchOptions.currentPage,
        pageSize: searchOptions.pageSize,
        total: searchOptions.totalElements,
      }"
      :show-size-changer="true"
      @change="handlePaginationChange"
    />

    <div v-if="error.orders" class="text-center py-10">
      <p class="text-lg text-red-500">
        {{ error.orders }}
      </p>
    </div>
  </div>
</template>
