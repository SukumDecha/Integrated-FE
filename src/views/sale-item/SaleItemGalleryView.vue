<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <div class="bg-white flex-grow">
      <div class="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <div class="flex justify-between items-center">
          <XBreadcrumb :items="breadcrumbs" />
          <XButton class-name="itbms-sale-item-add" @click="$router.push('/sale-items/add')">
            <PlusIcon class="h-5 w-5 mr-2" /> Add Sale Item
          </XButton>
        </div>

        <!-- Filter & Sort -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md">
          <!-- Filter by Brand -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
            <!-- Brand Selector (XSelector) -->
            <div class="min-w-[200px]">
              <XSelector
                v-model="filterOptions.selectedBrands"
                :options="brandOptions"
                placeholder="Select Brands"
                mode="multiple"
                class="itbms-brand-filter"
                @update:modelValue="onSelectedBrandsChange"
                @remove="removeBrand"
              />
            </div>

            <!-- Filter/Clear Buttons -->
            <XButton class="itbms-brand-filter-button" @click="applyFilter">
              <span class="mr-1">🔍</span> Filter
            </XButton>
            <XButton class="itbms-brand-filter-clear" @click="clearFilter"> Clear </XButton>
          </div>

          <!-- Active Toggle -->
          <div class="flex items-center gap-2">
            <label for="activeToggle" class="text-sm text-gray-700">Active Only</label>
            <XToggle
              id="activeToggle"
              v-model="filterOptions.activeOnly"
              class="itbms-toggle-active"
            />
          </div>

          <!-- Sort -->
          <div class="flex items-center gap-2">
            <XButton class="itbms-brand-none" @click="clearSort">No Sort</XButton>
            <XButton class="itbms-brand-asc" @click="sortAsc">Sort A-Z</XButton>
            <XButton class="itbms-brand-desc" @click="sortDesc">Sort Z-A</XButton>
          </div>
        </div>

        <!-- Heading -->
        <div class="space-y-2">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
          <p class="text-gray-500">Check out our most popular items this season.</p>
        </div>

        <!-- Sale Items -->
        <div v-if="saleItems.length > 0" class="mt-10">
          <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8">
            <SaleItemCard
              v-for="product in saleItems"
              :key="product.id"
              :id="product.id"
              :brand="product.brandName"
              :model="product.model"
              :ramGb="product.ramGb"
              :storageGb="product.storageGb"
              :price="product.price"
            />
          </div>

          <XPagination
            class="mt-8"
            :pagination="pagination"
            :show-size-changer="true"
            @change="onPaginate"
          />
        </div>

        <div v-else class="text-center py-10">
          <p class="text-lg text-gray-500">No sale items available.</p>
        </div>
      </div>
    </div>

    <XFooter :company-name="'Green Cart Inc.'" />
  </div>
</template>

<script setup>
import { onMounted, watchEffect, ref, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'

import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import SaleItemCard from '@/components/sale-item/SaleItemCard.vue'
import XFooter from '@/components/layout/XFooter.vue'
import XButton from '@/components/common/XButton.vue'
import XPagination from '@/components/common/XPagination.vue'
import XToggle from '@/components/common/form/XToggle.vue'
import XSelector from '@/components/common/form/XSelector.vue'

import { SaleItemService, BrandService } from '@/services'
import { PlusIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const loading = ref(true)
const error = ref(null)
const saleItems = reactive([])
const allBrands = ref([])

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', active: true },
]

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const filterOptions = reactive({
  selectedBrands: [],
  filteredBrands: [],
  sortField: undefined,
  sortOrder: undefined,
  activeOnly: false,
})

const brandOptions = computed(() => allBrands.value.map((b) => ({ label: b, value: b })))

const onSelectedBrandsChange = (val) => {
  filterOptions.selectedBrands = val
  filterOptions.filteredBrands = [...val]
  localStorage.setItem('saleItemsFilteredBrands', JSON.stringify(val))
}

const applyFilter = () => {
  if (Array.isArray(filterOptions.selectedBrands)) {
    filterOptions.filteredBrands = [...filterOptions.selectedBrands]
    localStorage.setItem('saleItemsFilteredBrands', JSON.stringify(filterOptions.filteredBrands))
  }
}

const removeBrand = (brand) => {
  filterOptions.filteredBrands = filterOptions.filteredBrands.filter((b) => b !== brand)
  filterOptions.selectedBrands = filterOptions.selectedBrands.filter((b) => b !== brand)
  localStorage.setItem('saleItemsFilteredBrands', JSON.stringify(filterOptions.filteredBrands))
}

const searchParamsObj = computed(() => ({
  page: pagination.currentPage - 1,
  size: pagination.pageSize,
  sortField: filterOptions.sortField,
  sortDirection: filterOptions.sortOrder,
  filterBrands: filterOptions.filteredBrands,
  activeOnly: filterOptions.activeOnly,
}))

const fetchSaleItems = async (params) => {
  loading.value = true
  const response = await SaleItemService.getSaleItemListPaginated(params.value)
  if (response.error) {
    error.value = response.error
    return
  }
  saleItems.splice(0, saleItems.length, ...response.data)
  pagination.total = response.pagination.totalItems
  loading.value = false
}

const fetchBrands = async () => {
  const res = await BrandService.getAllBrands()
  if (!res.error) {
    allBrands.value = res.data
      .map((b) => b.name)
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
  }
}

const sortAsc = () => {
  filterOptions.sortField = 'brand.name'
  filterOptions.sortOrder = 'asc'
  localStorage.setItem('saleItemsSort', JSON.stringify({ field: 'brand.name', order: 'asc' }))
}

const sortDesc = () => {
  filterOptions.sortField = 'brand.name'
  filterOptions.sortOrder = 'desc'
  localStorage.setItem('saleItemsSort', JSON.stringify({ field: 'brand.name', order: 'desc' }))
}

const clearSort = () => {
  filterOptions.sortField = undefined
  filterOptions.sortOrder = undefined
  localStorage.removeItem('saleItemsSort')
}

const clearFilter = () => {
  filterOptions.selectedBrands = []
  filterOptions.filteredBrands = []
  localStorage.removeItem('saleItemsFilteredBrands')
}

function onPaginate({ currentPage, pageSize }) {
  pagination.currentPage = currentPage
  pagination.pageSize = pageSize
}

const parseQueryToState = () => {
  const q = route.query
  pagination.currentPage = parseInt(q.page) || 1
  pagination.pageSize = parseInt(q.size) || 10

  if (q.sortField && q.sortDirection) {
    filterOptions.sortField = q.sortField
    filterOptions.sortOrder = q.sortDirection
  } else {
    const saved = localStorage.getItem('saleItemsSort')
    if (saved) {
      const { field, order } = JSON.parse(saved)
      filterOptions.sortField = field
      filterOptions.sortOrder = order
    }
  }

  if (q.filterBrands) {
    filterOptions.filteredBrands = q.filterBrands.split(',')
    filterOptions.selectedBrands = [...filterOptions.filteredBrands]
  } else {
    const savedFilter = localStorage.getItem('saleItemsFilteredBrands')
    if (savedFilter) {
      filterOptions.filteredBrands = JSON.parse(savedFilter)
      filterOptions.selectedBrands = [...filterOptions.filteredBrands]
    }
  }

  filterOptions.activeOnly = q.activeOnly === 'true'
}

const updateQueryString = () => {
  router.replace({
    query: {
      page: pagination.currentPage,
      size: pagination.pageSize,
      sortField: filterOptions.sortField,
      sortDirection: filterOptions.sortOrder,
      filterBrands: filterOptions.filteredBrands.join(','),
      activeOnly: filterOptions.activeOnly,
    },
  })
}

onMounted(async () => {
  parseQueryToState()
  await fetchBrands()
})

watch(
  () => searchParamsObj,
  async (newParams) => {
    updateQueryString()
    await fetchSaleItems(newParams)
  },
  { immediate: true, deep: true },
)

watchEffect(() => {
  if (route.query.toast === 'created') {
    toast.add({ message: 'The sale item has been successfully added.', type: 'success' })
    router.replace({ query: {} })
  }
})
</script>
