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
          :data="mockSaleItemList"
          :pagination="pagination"
          @update:pagination="onPaginate"
        >
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
                @click="deleteSaleItem(record.id)"
              />
            </div>
          </template>
        </XTable>
      </div>
    </XLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XNavbar from '@/components/layout/XNavbar.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XTable from '@/components/common/XTable.vue'

const router = useRouter()

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
  { title: 'Screen Size (inch)', key: 'itbms-screenSizeInch', dataIndex: 'screenSizeInch' },
  { title: 'Color', key: 'itbms-color', dataIndex: 'color' },
  { title: 'Price (Baht)', key: 'itbms-price', dataIndex: 'price' },
  { title: 'Quantity', key: 'itbms-quantity', dataIndex: 'quantity' },
  { title: 'Actions', key: 'actions', dataIndex: 'actions' },
]

const mockSaleItemList = ref([
  {
    id: 1,
    brandName: 'Apple',
    model: 'iPhone 14 Pro Max',
    ramGb: 6,
    storageGb: 256,
    screenSizeInch: 6.7,
    color: 'Deep Purple',
    price: 42900,
    quantity: 5,
  },
  {
    id: 2,
    brandName: 'Samsung',
    model: 'Galaxy S23 Ultra',
    ramGb: 8,
    storageGb: 512,
    screenSizeInch: 6.8,
    color: 'Phantom Black',
    price: 45900,
    quantity: 8,
  },
  {
    id: 3,
    brandName: 'Xiaomi',
    model: '13 Pro',
    ramGb: 12,
    storageGb: 256,
    screenSizeInch: 6.73,
    color: 'White',
    price: 29900,
    quantity: 10,
  },
  {
    id: 4,
    brandName: 'OnePlus',
    model: '11 5G',
    ramGb: 16,
    storageGb: 256,
    screenSizeInch: 6.7,
    color: 'Titan Black',
    price: 31900,
    quantity: 3,
  },
  {
    id: 5,
    brandName: 'Google',
    model: 'Pixel 7 Pro',
    ramGb: 12,
    storageGb: 128,
    screenSizeInch: 6.7,
    color: 'Snow',
    price: 28900,
    quantity: 4,
  },
  {
    id: 6,
    brandName: 'Vivo',
    model: 'X90 Pro',
    ramGb: 12,
    storageGb: 256,
    screenSizeInch: 6.78,
    color: 'Legend Black',
    price: 35900,
    quantity: 6,
  },
  {
    id: 7,
    brandName: 'Realme',
    model: 'GT Neo 5',
    ramGb: 16,
    storageGb: 512,
    screenSizeInch: 6.74,
    color: 'Booster Purple',
    price: 18900,
    quantity: 7,
  },
  {
    id: 8,
    brandName: 'Huawei',
    model: 'P60 Pro',
    ramGb: 8,
    storageGb: 256,
    screenSizeInch: 6.67,
    color: 'Black',
    price: 36900,
    quantity: 2,
  },
  {
    id: 9,
    brandName: 'Motorola',
    model: 'Edge 40 Pro',
    ramGb: 12,
    storageGb: 256,
    screenSizeInch: 6.67,
    color: 'Cosmic Black',
    price: 22900,
    quantity: 9,
  },
  {
    id: 10,
    brandName: 'Sony',
    model: 'Xperia 1 V',
    ramGb: 12,
    storageGb: 256,
    screenSizeInch: 6.5,
    color: 'Green',
    price: 45900,
    quantity: 1,
  },
  {
    id: 11,
    brandName: 'Asus',
    model: 'ROG Phone 7',
    ramGb: 16,
    storageGb: 512,
    screenSizeInch: 6.78,
    color: 'Storm White',
    price: 35900,
    quantity: 5,
  },
  {
    id: 12,
    brandName: 'OPPO',
    model: 'Find X6 Pro',
    ramGb: 16,
    storageGb: 512,
    screenSizeInch: 6.82,
    color: 'Brown',
    price: 37900,
    quantity: 4,
  },
  {
    id: 13,
    brandName: 'Nokia',
    model: 'X30 5G',
    ramGb: 6,
    storageGb: 128,
    screenSizeInch: 6.43,
    color: 'Ice White',
    price: 13900,
    quantity: 11,
  },
  {
    id: 14,
    brandName: 'Infinix',
    model: 'Zero 5G 2023',
    ramGb: 8,
    storageGb: 128,
    screenSizeInch: 6.78,
    color: 'Pearl White',
    price: 8990,
    quantity: 15,
  },
  {
    id: 15,
    brandName: 'Tecno',
    model: 'Phantom X2 Pro',
    ramGb: 12,
    storageGb: 256,
    screenSizeInch: 6.8,
    color: 'Mars Orange',
    price: 19900,
    quantity: 12,
  },
  {
    id: 16,
    brandName: 'iQOO',
    model: '11 5G',
    ramGb: 16,
    storageGb: 256,
    screenSizeInch: 6.78,
    color: 'Legend',
    price: 26900,
    quantity: 13,
  },
  {
    id: 17,
    brandName: 'Honor',
    model: 'Magic5 Pro',
    ramGb: 12,
    storageGb: 512,
    screenSizeInch: 6.81,
    color: 'Glacier Blue',
    price: 33900,
    quantity: 6,
  },
  {
    id: 18,
    brandName: 'Lenovo',
    model: 'Legion Y90',
    ramGb: 18,
    storageGb: 512,
    screenSizeInch: 6.92,
    color: 'Ultimate Black',
    price: 31900,
    quantity: 2,
  },
  {
    id: 19,
    brandName: 'Nothing',
    model: 'Phone (1)',
    ramGb: 8,
    storageGb: 256,
    screenSizeInch: 6.55,
    color: 'White',
    price: 17900,
    quantity: 14,
  },
])

const pagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: mockSaleItemList.value.length,
})

function onPaginate(newPageInfo) {
  pagination.value = newPageInfo
}

function editSaleItem(id) {
  router.push(`/sale-items/${id}/edit`)
}

function deleteSaleItem(id) {
  if (confirm(`Are you sure you want to delete sale item ID ${id}?`)) {
    const index = mockSaleItemList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      mockSaleItemList.value.splice(index, 1)
      pagination.value.total = mockSaleItemList.value.length
    }
  }
}

function onAdd() {
  router.push('/sale-items/add')
}

function onManage() {
  router.push('/brands')
}
</script>
