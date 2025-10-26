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

const router = useRouter()
const route = useRoute()
const toast = useToastStore()
const authStore = useAuthStore()

const ORDER_STORAGE_KEYS = {
  PAGINATION: 'ORDER_HISTORY_PAGINATION',
  SORT: 'ORDER_HISTORY_SORT',
}

const orders = ref([])
const latestFetchId = ref(0)

const loading = reactive({ orders: true })
const error = reactive({ orders: null })

const searchOptions = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
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
const activeTab = ref('completed')

const fetchOrders = async () => {
  const userId = authStore.userInfo.id
  if (!userId) return

  const requestId = ++latestFetchId.value
  const currentTab = activeTab.value.toUpperCase()

  loading.orders = true
  error.orders = null
  orders.value = [] // Clear orders immediately to prevent showing stale data

  loading.orders = true
  latestFetchId.value = requestId

  const response = await OrderService.getOrderByUserId(userId, {
    ...searchParams.value,
    tab: currentTab,
  })

  if (requestId !== latestFetchId.value) return

  if (response?.error) {
    error.orders = response.error.message || 'Failed to load order history.'
    toast.add({ type: 'error', message: error.orders })
  } else {
    // ถ้า success — ใช้ response ตามต้องการ
    orders.value = response.data || []
  }

  loading.orders = false

  if (requestId !== latestFetchId.value) return

  if (response.error) {
    error.orders = response.error || 'Failed to load order history.'
    toast.add({ type: 'error', message: error.orders })
  } else {
    orders.value = response.data || []
    const p = response.pagination || {}
    searchOptions.totalItems = p.totalItems ?? 0
    searchOptions.pageSize = p.pageSize ?? searchOptions.pageSize
  }
}
const handlePaginationChange = ({ currentPage, pageSize }) => {
  // อัปเดต state ในหน้า
  searchOptions.currentPage = currentPage
  searchOptions.pageSize = pageSize

  saveToSessionStorage(ORDER_STORAGE_KEYS.PAGINATION, { currentPage, pageSize })

  router.push({
    query: {
      ...searchParams.value,
      page: currentPage,
    },
  })
}

watch(
  () => [route.query.page, route.query.size],
  async ([qPage, qSize]) => {
    searchOptions.currentPage = Number(qPage) || searchOptions.currentPage || 1
    searchOptions.pageSize = Number(qSize) || searchOptions.pageSize || 10
    await fetchOrders()
  },
  { immediate: true },
)

onMounted(async () => {
  initializeState()
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

const groupedFilteredOrders = computed(() => {
  return orders.value.reduce((acc, order) => {
    const seller = order.seller?.nickname || 'Unknown'
    if (!acc[seller]) acc[seller] = []
    acc[seller].push(order)
    return acc
  }, {})
})
watch(activeTab, async () => {
  searchOptions.currentPage = 1
  await fetchOrders()
})
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-semibold text-green-700 mb-6">
      Your Orders
    </h1>
    <XTab
      v-model="activeTab"
      :tabs="[
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
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
          :is-buyer-card="true"
        />
      </div>
    </div>
    <div
      v-if="!loading.orders && orders.length === 0 && !error.orders"
      class="text-center text-gray-500 text-lg py-20"
    >
      You don't have any {{ activeTab }} orders.
    </div>

    <XPagination
      v-if="!loading.orders && orders.length > 0"
      class="mt-10"
      :pagination="{
        currentPage: searchOptions.currentPage,
        pageSize: searchOptions.pageSize,
        total: searchOptions.totalItems,
      }"
      :show-size-changer="true"
      @change="handlePaginationChange"
    />

    <div
      v-if="error.orders"
      class="text-center py-10"
    >
      <p class="text-lg text-red-500">
        {{ error.orders }}
      </p>
    </div>
  </div>
</template>
