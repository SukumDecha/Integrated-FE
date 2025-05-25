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
import { SaleItemService } from '@/services'
import { PlusIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const loading = ref(true)
const error = ref(null)
const saleItems = reactive([])

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
  filteredBrands: undefined,
  sortField: undefined, // 'brand.name' or 'undefined'
  sortOrder: undefined, // 'asc', 'desc', or null
})

const searchParamsObj = computed(() => {
  return {
    page: pagination.currentPage - 1,
    size: pagination.pageSize,
    sortField: filterOptions.sortField,
    sortDirection: filterOptions.sortOrder,
    filterBrands: filterOptions.filteredBrands,
  }
})

const parseQueryToState = () => {
  if (route.query) {
    const parsedParams = route.query

    pagination.currentPage = parseInt(parsedParams.page) || pagination.currentPage
    pagination.pageSize = parseInt(parsedParams.size) || pagination.pageSize
    filterOptions.sortField = parsedParams.sortField
    filterOptions.sortOrder = parsedParams.sortDirection
    filterOptions.filteredBrands = parsedParams.filterBrands
      ? parsedParams.filterBrands.split(',')
      : undefined
  }
}

function onPaginate({
  currentPage,
  pageSize
}) {
  pagination.currentPage = currentPage
  pagination.pageSize = pageSize
}
async function fetchSaleItems(params) {
  loading.value = true
  const response = await SaleItemService.getSaleItemListPaginated({
    ...params.value
  })

  if (response.error) {
    console.error('Error fetching Sale Items:', response.error)
    error.value = response.error
    return
  }

  saleItems.splice(0, saleItems.length)
  saleItems.push(...response.data)
  pagination.total = response.pagination.totalItems

  loading.value = false
}

onMounted(async () => {
  parseQueryToState()
})

watch(
  ()  => searchParamsObj,
  async (newParams) => {
    await fetchSaleItems(newParams)

    router.replace({
      query: {
        ...route.query,
        page: pagination.currentPage,
        size: pagination.pageSize,
        sortField: filterOptions.sortField,
        sortDirection: filterOptions.sortOrder,
        filterBrands: filterOptions.filteredBrands?.join(','),
      },
    })
  },
  {
    immediate: true,
    deep: true,
  }
)

watchEffect(() => {
  if (route.query.toast === 'created') {
    toast.add({ message: 'The sale item has been successfully added.', type: 'success' })

    router.replace({ query: {} })
  }
})

</script>

<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <div class="bg-white flex-grow">
      <div class="max-w-7xl mx-auto py-8 px-4 space-y-6">
        <div class="flex justify-between items-center">
          <XBreadcrumb :items="breadcrumbs" />

          <XButton
          class-name="itbms-sale-item-add"
          @click="$router.push('/sale-items/add')">
            <PlusIcon class="h-5 w-5 mr-2" />
            Add Sale Item
          </XButton>
        </div>

        <div class="space-y-2">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
          <p class="text-gray-500">Check out our most popular items this season.</p>
        </div>

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
