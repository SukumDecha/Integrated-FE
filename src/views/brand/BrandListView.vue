<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <XLayout class="flex-grow space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <div class="flex justify-between items-center mb-4">
        <XButton
          label="Add Brand"
          variant="primary"
          size="md"
          className="itbms-add-button"
          @click="goToAdd"
        />
      </div>

      <XTable
        :columns="columns"
        :data="brands"
        :pagination="pagination"
        @update:pagination="onPaginate"
      >
        <template #actions="{ record }">
          <div class="flex space-x-2">
            <XButton
              label="Edit"
              variant="outline"
              size="xs"
              className="itbms-edit-button"
              @click="editBrand(record.id)"
            />
            <XButton
              label="Delete"
              variant="danger"
              size="xs"
              className="itbms-delete-button"
              @click="askDeleteBrand(record)"
            />
          </div>
        </template>
      </XTable>
    </XLayout>

    <XFooter />

    <!-- Confirm Delete Modal -->
    <XConfirmModal
      v-model="showConfirm"
      title="Delete Brand"
      :message="`Are you sure you want to delete brand ${brandToDelete?.name || ''}?`"
      @confirm="confirmDeleteBrand"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import XNavbar from '@/components/layout/XNavbar.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XFooter from '@/components/layout/XFooter.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XTable from '@/components/common/XTable.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/XConfirmModal.vue'
import { BrandService } from '@/services'

const router = useRouter()
const brands = ref([])

const showConfirm = ref(false)
const brandToDelete = ref(null)

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Brands', path: '/brands', active: true },
]

const columns = [
  { title: 'ID', key: 'itbms-id', dataIndex: 'id' },
  { title: 'Name', key: 'itbms-name', dataIndex: 'name' },
  { title: 'Actions', key: 'actions', dataIndex: 'actions' },
]

const fetchBrands = async () => {
  const response = await BrandService.getAllBrands()
  if (response.error) {
    console.error('Error fetching Brands:', response.error)
    return
  }
  brands.value = response.data
  pagination.value.total = brands.value.length
}

onMounted(fetchBrands)

const pagination = ref({
  currentPage: 1,
  pageSize: 5,
  total: 0,
})

function onPaginate(newPageInfo) {
  pagination.value = newPageInfo
}

function goToAdd() {
  router.push('/brands/add')
}

function editBrand(id) {
  router.push(`/brands/${id}`)
}

function askDeleteBrand(brand) {
  brandToDelete.value = brand
  showConfirm.value = true
}

function confirmDeleteBrand() {
  if (!brandToDelete.value) return
  brands.value = brands.value.filter(b => b.id !== brandToDelete.value.id)
  pagination.value.total = brands.value.length
  brandToDelete.value = null
  showConfirm.value = false
}
</script>
