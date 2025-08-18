<script setup>
import { onMounted, watch, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'

import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XPagination from '@/components/common/XPagination.vue'
import XSelector from '@/components/common/form/XSelector.vue'
import SaleItemCard from '@/components/sale-item/SaleItemCard.vue'
import XInput from '@/components/common/form/XInput.vue'

import { AlignJustify, ArrowDownWideNarrow, ArrowUpWideNarrow, PlusIcon } from 'lucide-vue-next'

import { SaleItemService, BrandService } from '@/services'
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/StorageUtils'
import { LOCAL_STORAGE_KEYS } from '@/constants/sale-item.constant'

// --- State Management ---
const searchOptions = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  sortField: undefined,
  sortOrder: undefined,
  filteredBrands: [],
  filteredPrices: null,
  filteredStorages: [],
  activeOnly: false,
})

const priceOptions = computed(() => [
  { label: '0 - 5,000 Baht', value: '0-5000' },
  { label: '5,001 - 10,000 Baht', value: '5001-10000' },
  { label: '10,001 - 20,000 Baht', value: '10001-20000' },
  { label: '20,001 - 30,000 Baht', value: '20001-30000' },
  { label: '30,001 - 40,000 Baht', value: '30001-40000' },
  { label: '40,001 - 50,000 Baht', value: '40001-50000' },
  { label: '50,000 + Baht', value: '50000+' },
])

const storageOptions = computed(() => [
  { label: '32 GB', value: 32 },
  { label: '64 GB', value: 64 },
  { label: '128 GB', value: 128 },
  { label: '256 GB', value: 256 },
  { label: '512 GB', value: 512 },
  { label: '1 TB+', value: 1024 },
  { label: 'Not specified', value: -1 },
])

const allBrands = reactive([])
const saleItems = reactive([])

const loading = reactive({
  items: true,
  brands: false,
})

const error = reactive({
  items: null,
  brands: null,
})

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', active: true },
]

const customPrice = reactive({
  min: '',
  max: '',
})

const brandOptions = computed(() => allBrands.map((b) => ({ label: b, value: b })))

const searchParams = computed(() => {
  // แปลงค่าเป็น number (หรือ null ถ้าว่าง)
  const priceMinVal = customPrice.min !== '' ? Number(customPrice.min) : null
  const priceMaxVal = customPrice.max !== '' ? Number(customPrice.max) : null

  // ถ้ามีเฉพาะ min แต่ไม่มี max -> ให้ exact match โดยส่ง min=max=ราคา
  const [minToSend, maxToSend] =
    priceMinVal !== null && priceMaxVal === null
      ? [priceMinVal, priceMinVal]
      : [priceMinVal, priceMaxVal]

  return {
    page: searchOptions.currentPage - 1,
    size: searchOptions.pageSize,
    sortField: searchOptions.sortField,
    sortDirection: searchOptions.sortOrder,
    filterBrands: searchOptions.filteredBrands,
    filterPrices: searchOptions.filteredPrices,
    filterStorages: searchOptions.filteredStorages,
    activeOnly: searchOptions.activeOnly,
    priceMin: minToSend,
    priceMax: maxToSend,
  }
})

watch(
  () => ({ min: customPrice.min, max: customPrice.max }),
  (value) => {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.CUSTOM_PRICE, value)
  },
  { deep: true },
)

watch(
  () => searchOptions.filteredStorages,
  (value) => {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.FILTER_STORAGES, value)
  },
  { deep: true },
)

watch(
  () => searchOptions.filteredPrices,
  (value) => {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.FILTER_PRICES, value)
  },
)

const initializeStateFromRouteOrStorage = () => {
  const q = route.query

  // Pagination
  searchOptions.currentPage =
    parseInt(q.page, 10) || loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {}).currentPage || 1
  searchOptions.pageSize =
    parseInt(q.size, 10) || loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {}).pageSize || 10

  // Sort
  searchOptions.sortField = q.sortField || loadFromLocalStorage(LOCAL_STORAGE_KEYS.SORT, {}).field
  searchOptions.sortOrder =
    q.sortDirection || loadFromLocalStorage(LOCAL_STORAGE_KEYS.SORT, {}).order

  // Filter Brands
  searchOptions.filteredBrands = q.filterBrands
    ? q.filterBrands.split(',')
    : loadFromLocalStorage(LOCAL_STORAGE_KEYS.FILTER_BRANDS, [])

  // Filter Prices
  let priceFromLS = loadFromLocalStorage(LOCAL_STORAGE_KEYS.FILTER_PRICES, null)
  if (Array.isArray(priceFromLS)) priceFromLS = priceFromLS[0] ?? null

  searchOptions.filteredPrices =
    typeof priceFromRoute === 'string' && priceFromRoute !== ''
      ? priceFromRoute
      : typeof priceFromLS === 'string' && priceFromLS !== ''
        ? priceFromLS
        : null

  // Custom price min/max
  const customPriceLS = loadFromLocalStorage(LOCAL_STORAGE_KEYS.CUSTOM_PRICE, {
    min: '',
    max: '',
  })
  customPrice.min = customPriceLS.min ?? ''
  customPrice.max = customPriceLS.max ?? ''

  // Filter Storages
  searchOptions.filteredStorages = q.filterStorages
    ? q.filterStorages.split(',').map(Number)
    : loadFromLocalStorage(LOCAL_STORAGE_KEYS.FILTER_STORAGES, [])

  // Active Only
  searchOptions.activeOnly = q.activeOnly === 'true' || false

  updateRouteQuery()
}

/**
 * Updates the URL query parameters based on current searchOptions.
 */
const updateRouteQuery = () => {
  const query = {}

  if (searchOptions.currentPage) query.page = searchOptions.currentPage
  if (searchOptions.pageSize) query.size = searchOptions.pageSize

  if (searchOptions.sortField) query.sortField = searchOptions.sortField
  if (searchOptions.sortOrder) query.sortDirection = searchOptions.sortOrder

  if (searchOptions.filteredBrands.length > 0)
    query.filterBrands = searchOptions.filteredBrands.join(',')
  if (searchOptions.activeOnly) query.activeOnly = true

  if (searchOptions.filteredPrices) query.filterPrices = searchOptions.filteredPrices

  if (Array.isArray(searchOptions.filteredStorages) && searchOptions.filteredStorages.length > 0)
    query.filterStorages = searchOptions.filteredStorages.join(',')

  router.replace({ query })
}

// --- Data Fetching ---
const fetchSaleItems = async () => {
  loading.items = true
  error.items = null

  const response = await SaleItemService.getSaleItemListPaginated(searchParams.value)

  if (response.error) {
    error.items = response.error.message || 'Failed to load sale items. Please try again later.'
    toast.add({
      type: 'error',
      message: error.items,
    })
    loading.items = false
    return
  }

  saleItems.splice(0, saleItems.length)
  saleItems.push(...response.data)
  searchOptions.totalItems = response.pagination.totalItems
  loading.items = false
}

const fetchBrands = async () => {
  loading.brands = true
  error.brands = null

  const response = await BrandService.getAllBrands()
  if (response.error) {
    error.brands = response.error.message || 'Failed to load brands. Please try again later.'
    toast.add({
      type: 'error',
      message: 'Failed to load brands. Please try again later.',
    })
    loading.brands = false
    return
  }

  allBrands.push(...response.data.map((b) => b.name).sort((a, b) => a.localeCompare(b)))
  loading.brands = false
}

const handlePaginationChange = async ({ currentPage, pageSize }) => {
  const oldCurrentPage = searchOptions.currentPage

  searchOptions.currentPage = currentPage
  searchOptions.pageSize = pageSize

  if (oldCurrentPage === currentPage) {
    await fetchSaleItems()
  }

  saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, { currentPage, pageSize })
}

const setSort = (field, order) => {
  searchOptions.sortField = field
  searchOptions.sortOrder = order
  if (field && order) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.SORT, { field, order })
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SORT)
  }
}

const sortAscByName = () => setSort('brand.name', 'asc')
const sortDescByName = () => setSort('brand.name', 'desc')
const clearSort = () => setSort(undefined, undefined)

const handleBrandSelect = (selectedBrands) => {
  searchOptions.filteredBrands = [...selectedBrands]
  saveToLocalStorage(LOCAL_STORAGE_KEYS.FILTER_BRANDS, selectedBrands)
  resetPagination(false)
}

const handleBrandRemove = (brandToRemove) => {
  searchOptions.filteredBrands = searchOptions.filteredBrands.filter((b) => b !== brandToRemove)
  saveToLocalStorage(LOCAL_STORAGE_KEYS.FILTER_BRANDS, searchOptions.filteredBrands)
  resetPagination(false)
}

const clearAllFilter = () => {
  searchOptions.filteredBrands = []
  searchOptions.filteredPrices = null
  searchOptions.filteredStorages = []

  customPrice.min = ''
  customPrice.max = ''

  localStorage.removeItem(LOCAL_STORAGE_KEYS.FILTER_BRANDS)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.FILTER_PRICES)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.FILTER_STORAGES)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.CUSTOM_PRICE)

  resetPagination(false)
}

const resetPagination = (resetPageSize) => {
  searchOptions.currentPage = 1

  if (resetPageSize) {
    searchOptions.pageSize = 5
  }

  saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {
    currentPage: searchOptions.currentPage,
    pageSize: searchOptions.pageSize,
  })
}

onMounted(async () => {
  initializeStateFromRouteOrStorage()
  await fetchBrands()
  await fetchSaleItems()
})

watch(
  searchParams,
  async (newParams, oldParams) => {
    // If we use deep check, it won't allow us to fetch the same page
    // if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
    //   updateRouteQuery();
    //   await fetchSaleItems();
    // }
    updateRouteQuery()
    await fetchSaleItems()
  },
  { deep: true },
)

watch(
  () => route.query.toast,
  (newToastValue) => {
    if (newToastValue === 'created') {
      toast.add({ message: 'The sale item has been successfully added.', type: 'success' })
      // Remove the toast query parameter
      const newQuery = { ...route.query }
      delete newQuery.toast
      router.replace({ query: newQuery })
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="bg-white flex-grow">
    <div class="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div class="flex justify-between items-center">
        <XBreadcrumb :items="breadcrumbs" />
        <XButton class-name="itbms-sale-item-add" @click="$router.push('/sale-items/add')">
          <PlusIcon class="h-5 w-5 mr-2" /> Add Sale Item
        </XButton>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
          <!-- brand filter -->
          <div class="min-w-[200px]">
            <XSelector
              v-model="searchOptions.filteredBrands"
              :options="brandOptions"
              placeholder="Select Brands"
              mode="multiple"
              class="itbms-brand-filter itbms-brand-filter-button"
              :searchable="true"
              :clearable="true"
              @update:model-value="handleBrandSelect"
              @remove="handleBrandRemove"
            />
          </div>
          <!-- Price filter -->
          <div class="min-w-[200px]">
            <XSelector
              v-model="searchOptions.filteredPrices"
              :options="priceOptions"
              placeholder="Price Range"
              class="itbms-price-filter"
              :searchable="false"
              :clearable="true"
              @update:model-value="() => resetPagination(false)"
            />
          </div>
          <!-- Storage filter -->
          <div class="min-w-[200px]">
            <XSelector
              v-model="searchOptions.filteredStorages"
              :options="storageOptions"
              placeholder="Storage Range"
              mode="multiple"
              class="itbms-storage-size-filter"
              :searchable="false"
              :clearable="true"
              @update:model-value="() => resetPagination(false)"
            />
          </div>
          <XButton class-name="itbms-brand-filter-clear" @click="clearAllFilter"> Clear </XButton>
        </div>

        <div class="flex flex-wrap items-center gap-2 p-4 pt-0 rounded-md"></div>

        <div class="flex items-center gap-2">
          <XButton
            class-name="itbms-brand-none"
            variant="info"
            :disabled="!searchOptions.sortField && !searchOptions.sortOrder"
            @click="clearSort"
          >
            <AlignJustify />
          </XButton>
          <XButton
            class-name="itbms-brand-asc"
            variant="info"
            :disabled="
              searchOptions.sortField === 'brand.name' && searchOptions.sortOrder === 'asc'
            "
            @click="sortAscByName"
          >
            <ArrowUpWideNarrow />
          </XButton>
          <XButton
            class-name="itbms-brand-desc"
            variant="info"
            :disabled="
              searchOptions.sortField === 'brand.name' && searchOptions.sortOrder === 'desc'
            "
            @click="sortDescByName"
          >
            <ArrowDownWideNarrow />
          </XButton>
        </div>
      </div>

      <!-- แถวล่าง: Min / Max -->
      <div class="flex flex-wrap items-center gap-2 px-4 pt-2 pb-0 rounded-md">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
          <div class="min-w-[200px]">
            <XInput
              v-model="customPrice.min"
              type="number"
              placeholder="Min"
              step="1"
              variant="filter"
              @keydown.enter.prevent="resetPagination(false)"
            />
          </div>

          <div class="min-w-[200px]">
            <XInput
              v-model="customPrice.max"
              type="number"
              placeholder="Max"
              step="1"
              variant="filter"
              @keydown.enter.prevent="resetPagination(false)"
            />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
        <p class="text-gray-500">Check out our most popular items this season.</p>
      </div>

      <div class="mt-10">
        <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8">
          <SaleItemCard
            v-for="product in saleItems"
            :id="product.id"
            :key="product.id"
            :brand="product.brandName"
            :model="product.model"
            :ram-gb="product.ramGb"
            :storage-gb="product.storageGb"
            :price="product.price"
            :is-loading="loading.items"
          />
        </div>

        <XPagination
          class="mt-8"
          :v-if="!loading.items && saleItems.length > 0"
          :pagination="{
            currentPage: searchOptions.currentPage,
            pageSize: searchOptions.pageSize,
            total: searchOptions.totalItems,
          }"
          :show-size-changer="true"
          @change="handlePaginationChange"
        />
      </div>
      <div
        v-if="!loading.items && saleItems.length === 0 && !error.items"
        class="text-center py-10 itbms-row"
      >
        <p class="text-lg text-gray-500">no sale item</p>
      </div>
    </div>
  </div>
</template>
