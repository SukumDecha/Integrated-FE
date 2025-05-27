<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XTable from '@/components/common/XTable.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'

const router = useRouter()
const route = useRoute()
const brands = ref([])
const toast = useToastStore()

const showConfirm = ref(false)
const brandToDelete = ref(null)
const modalMessage = ref('')
const showConfirmButton = ref(true)

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Brands', path: '/brands', active: true },
]

const columns = [
  { title: 'ID', key: 'itbms-id', dataIndex: 'id' },
  { title: 'Name', key: 'itbms-name', dataIndex: 'name' },
  { title: 'Actions', key: 'actions', dataIndex: 'actions', width: '300px'},
]

const fetchBrands = async () => {
  const response = await BrandService.getAllBrands()
  if (response.error) {
    console.error('Error fetching Brands:', response.error)
    return
  }
  brands.value = response.data
  // pagination.value.total = brands.value.length
}

onMounted(fetchBrands)

watchEffect(() => {
  if (route.query.toast === 'created') {
    toast.add({ message: 'The brand has been added.', type: 'success' })
    router.replace({ query: {} })
  }

  if (route.query.toast === 'edited') {
    toast.add({ message: 'The brand has been updated.', type: 'success' })
    fetchBrands()
    router.replace({ query: {} })
  }
})

// const pagination = ref({
//   currentPage: 1,
//   pageSize: 25,
//   total: 0,
// })

// function onPaginate(newPageInfo) {
//   pagination.value = newPageInfo
// }

function goToAdd() {
  router.push('/brands/add')
}

function editBrand(id) {
  router.push(`/brands/${id}/edit`)
}

async function askDeleteBrand(brand) {
  brandToDelete.value = brand

  const res = await BrandService.getBrandById(brand.id)

  // if (res.error) {
  //   toast.add({
  //     message: 'Brand not found.',
  //     type: 'error'
  //   })
  //   return
  // }

  const brandDetails = res.data

  if (brandDetails && brandDetails.noOfSaleItems > 0) {
      modalMessage.value = `Delete ${brandDetails.name} is not allowed. There are sale items with ${brandDetails.name} brand.`
      showConfirmButton.value = false
  } else {
      modalMessage.value = ''
      showConfirmButton.value = true
  }

  showConfirm.value = true
}

async function confirmDeleteBrand() {
  if (!brandToDelete.value) return

  const id = brandToDelete.value.id

  const res = await BrandService.deleteBrand(id);

  if (res.error) {
    toast.add({
       message: 'An error has occurred, the brand does not exist.',
       type: 'error'
      })
    return
  }

  // ✅ สำเร็จ → ปิด modal, ลบรายการ
  brands.value = brands.value.filter((b) => b.id !== id)
  // pagination.value.total = brands.value.length
  toast.add({
    message: 'The brand has been deleted.',
    type: 'success'
  })

  brandToDelete.value = null
  showConfirm.value = false
}


</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="flex justify-between items-center mb-4">
    <XButton
      label="Add Brand"
      variant="primary"
      size="md"
      class="itbms-add-button"
      @click="goToAdd"
    />
  </div>

  <XTable
    :columns="columns"
    :data="brands"
  >
    <template #actions="{ record }">
      <div class="flex space-x-2">
        <XButton
          label="Edit"
          variant="outline"
          size="xs"
          class="itbms-edit-button"
          @click="editBrand(record.id)"
        />
        <XButton
          label="Delete"
          variant="danger"
          size="xs"
          class="itbms-delete-button"
          @click="askDeleteBrand(record)"
        />
      </div>
    </template>
  </XTable>

  <!-- Confirm Delete Modal -->
  <XConfirmModal
    v-model="showConfirm"
    title="Delete Brand"
    :message="modalMessage || `Do you want to delete ${brandToDelete?.name || ''} brand?`"
    :show-confirm="showConfirmButton"
    @confirm="confirmDeleteBrand"
  />
</template>
