<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <XLayout class="flex-grow space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <div class="flex justify-between items-center mb-4">
        <XButton
          label="Add Sale Item"
          variant="primary"
          size="md"
          className="itbms-sale-item-add"
          @click="onAdd"
        />
        <XButton
          label="Manage Brand"
          variant="outline"
          size="md"
          className="itbms-manage-brand"
          @click="onManage"
        />
      </div>

      <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Sale Item Table</h1>

        <XTable
          :columns="columns"
          :data="saleItems"
          :pagination="pagination"
          :pageSizeOptions="[5, 10, 25, 50]"
          @change="onPaginate"
          emptyText="No sale item"
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
                className="itbms-edit-button"
                label="Edit"
                @click="editSaleItem(record.id)"
              />
              <XButton
                size="sm"
                variant="danger"
                className="itbms-delete-button"
                label="Delete"
                @click="askDeleteItem(record)"
              />
            </div>
          </template>
        </XTable>
      </div>
    </XLayout>

    <XConfirmModal
      v-model="showConfirm"
      title="Delete Sale Item"
      :message="`Do you want to delete this sale item?`"
      @confirm="confirmDeleteItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XNavbar from '@/components/layout/XNavbar.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { SaleItemService } from '@/services'
import { formatPrice, displayOrDash } from '@/utils/TextUtils'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()
const route = useRoute()
const toast = useToastStore()
const saleItems = ref([])
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

const pagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: 0,
})

const filterOptions = ref({
  filteredBrands: undefined,
  sortField: 'createdOn', // 'brand.name' or 'null'
  sortOrder: 'desc', // 'asc', 'desc', or null
})

const searchParamsObj = computed(() => {
  return {
    page: pagination.value.currentPage - 1,
    size: pagination.value.pageSize,
    sortField: filterOptions.value.sortField,
    sortDirection: filterOptions.value.sortOrder,
    filterBrands: filterOptions.value.filteredBrands,
  }
})

onMounted(async () => {
  if (route.query) {
    const parsedParams = route.query

    pagination.value.currentPage = parseInt(parsedParams.page) || 1
    pagination.value.pageSize = parseInt(parsedParams.size) || 5
    filterOptions.value.sortField = parsedParams.sortField || 'createdOn'
    filterOptions.value.sortOrder = parsedParams.sortDirection || 'desc'
    filterOptions.value.filteredBrands = parsedParams.filterBrands
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

  saleItems.value = response.data
  pagination.value.total = response.pagination.totalItems

  router.replace({
    query: {
      ...route.query,
      page: pagination.value.currentPage,
      size: pagination.value.pageSize,
      sortField: filterOptions.value.sortField,
      sortDirection: filterOptions.value.sortOrder,
      filterBrands: filterOptions.value.filteredBrands?.join(','),
    },
  })
})

function onPaginate(newPageInfo) {
  pagination.value = newPageInfo
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

  saleItems.value = saleItems.value.filter((item) => item.id !== id)
  pagination.value.total = saleItems.value.length

  toast.add({ message: 'The sale item has been deleted.', type: 'success' })

  itemToDelete.value = null
  showConfirm.value = false
}

function onAdd() {
  router.push('/sale-items/add')
}
function onManage() {
  router.push('/brands')
}
</script>
