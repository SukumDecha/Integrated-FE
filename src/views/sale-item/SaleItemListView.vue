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
          emptyText="No sale item"
          @update:pagination="onPaginate"
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
                variant="link"
                className="itbms-edit-button"
                label="Edit"
                @click="editSaleItem(record.id)"
              />
              <XButton
                size="sm"
                variant="link"
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
      :message="`Are you sure you want to delete item ${itemToDelete?.model || ''}?`"
      @confirm="confirmDeleteItem"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import XNavbar from '@/components/layout/XNavbar.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'
import XConfirmModal from '@/components/common/XConfirmModal.vue'
import { SaleItemService } from '@/services'
import { formatPrice, displayOrDash } from '@/utils/TextUtils'

const router = useRouter()

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
  pageSize: 20,
  total: 0,
})

onMounted(async () => {
  const response = await SaleItemService.getSaleItemList()
  if (response.error) {
    console.error('Error fetching Sale Items:', response.error)
    return
  }
  saleItems.value = response.data
  pagination.value.total = saleItems.value.length
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

function confirmDeleteItem() {
  if (!itemToDelete.value) return
  const index = saleItems.value.findIndex((i) => i.id === itemToDelete.value.id)
  if (index !== -1) {
    saleItems.value.splice(index, 1)
    pagination.value.total = saleItems.value.length
  }
  itemToDelete.value = null
}
function onAdd() {
  router.push('/sale-items/add')
}
function onManage() {
  router.push('/brands')
}
</script>
