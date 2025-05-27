<script setup>
import { ref, onMounted, watchEffect, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { SaleItemService } from '@/services'
import { formatPrice, displayOrDash } from '@/utils/TextUtils'
import { useToastStore } from '@/stores/toast.store'
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/StorageUtils'
import { LOCAL_STORAGE_KEYS } from '@/constants/sale-item'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()

const saleItems = reactive([])

const itemToDelete = ref(null)
const showConfirm = ref(false)

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items', active: true },
]

const columns = [
  { title: 'ID', key: 'itbms-id', dataIndex: 'id' },
  { title: 'Brand', key: 'itbms-brand', dataIndex: 'brandName' },
  { title: 'Model', key: 'itbms-model', dataIndex: 'model' },
  { title: 'RAM (GB)', key: 'itbms-ramGb', dataIndex: 'ramGb' },
  { title: 'Storage (GB)', key: 'itbms-storageGb', dataIndex: 'storageGb' },
  { title: 'Color', key: 'itbms-color', dataIndex: 'color' },
  { title: 'Price (Baht)', key: 'itbms-price', dataIndex: 'price' },
  { title: 'Actions', key: 'actions', dataIndex: 'actions' },
]

const pagination = reactive({
  currentPage: 1,
  pageSize: 100,
  total: 0,
})

const filterOptions = reactive({
  filteredBrands: undefined,
  sortField: 'createdOn', // 'brand.name' or 'null'
  sortOrder: 'desc', // 'asc', 'desc', or null
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

onMounted(async () => {
  if (route.query) {
    const parsedParams = route.query

    pagination.currentPage = parseInt(parsedParams.page) || 1
    pagination.pageSize = parseInt(parsedParams.size) || 5
    filterOptions.sortField = parsedParams.sortField || 'createdOn'
    filterOptions.sortOrder = parsedParams.sortDirection || 'desc'
    filterOptions.filteredBrands = parsedParams.filterBrands
      ? parsedParams.filterBrands.split(',')
      : undefined
  }
})

watchEffect(() => {
  if (route.query.toast === 'created') {
    toast.add({ message: 'The sale item has been successfully added.', type: 'success' })

    router.replace({ query: {} })
  }
})

watchEffect(async () => {
  const response = await SaleItemService.getSaleItemListPaginated({
    ...searchParamsObj.value,
  })

  if (response.error) {
    console.error('Error fetching Sale Items with filters:', response.error)
    return
  }

  saleItems.splice(0, saleItems.length)
  saleItems.push(...response.data)
  pagination.total = response.pagination.totalItems

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
})

function onPaginate({ currentPage, pageSize }) {
  pagination.currentPage = currentPage
  pagination.pageSize = pageSize
}

function editSaleItem(id) {
  router.push(`/sale-items/${id}/edit`)
}

function askDeleteItem(item) {
  itemToDelete.value = item
  showConfirm.value = true
}

async function confirmDeleteItem() {
  if (!itemToDelete.value) return

  const id = itemToDelete.value.id

  const res = await SaleItemService.deleteSaleItem(id)

  if (res.error) {
    toast.add({ message: 'Failed to delete sale item.', type: 'error' })
    return
  }

  const index = saleItems.findIndex(item => item.id === id)
  if (index !== -1) {
    saleItems.splice(index, 1)
  }

  router.replace({
    query: {
      ...route.query,
    },
  })
  toast.add({ message: 'The sale item has been deleted.', type: 'success' })

  itemToDelete.value = null
  showConfirm.value = false

  const paginationState = loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION)

  saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {
    ...paginationState,
    currentPage: 1,
  })
}

function onAdd() {
  router.push('/sale-items/add')
}
function onManage() {
  router.push('/brands')
}
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="flex justify-between items-center mb-4">
    <XButton
      label="Add Sale Item"
      variant="primary"
      size="md"
      class-name="itbms-sale-item-add"
      @click="onAdd"
    />
    <XButton
      label="Manage Brand"
      variant="outline"
      size="md"
      class-name="itbms-manage-brand"
      @click="onManage"
    />
  </div>

  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">
      Sale Item Table
    </h1>

    <XTable
      :columns="columns"
      :data="saleItems"
      empty-text="No sale item"
      @change="onPaginate"
    >
      <!-- Format ราคาด้วย comma -->
      <template #itbms-price="{ record }">
        {{ formatPrice(record.price) }}
      </template>

      <!-- Show RAM หรือ '-' -->
      <template #itbms-ramGb="{ record }">
        {{ displayOrDash(record.ramGb) }}
      </template>

      <!-- Show Storage หรือ '-' -->
      <template #itbms-storageGb="{ record }">
        {{ displayOrDash(record.storageGb) }}
      </template>

      <!-- Show สี หรือ '-' -->
      <template #itbms-color="{ record }">
        {{ displayOrDash(record.color) }}
      </template>

      <!-- ปุ่ม Edit/Delete -->
      <template #actions="{ record }">
        <div class="flex space-x-2">
          <XButton
            size="sm"
            variant="outline"
            class-name="itbms-edit-button"
            label="Edit"
            @click="editSaleItem(record.id)"
          />
          <XButton
            size="sm"
            variant="danger"
            class-name="itbms-delete-button"
            label="Delete"
            @click="askDeleteItem(record)"
          />
        </div>
      </template>
    </XTable>
  </div>

  <XConfirmModal
    v-model="showConfirm"
    title="Delete Sale Item"
    message="`Do you want to delete this sale item?`"
    @confirm="confirmDeleteItem"
  />
</template>
