<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XTable from '@/components/common/XTable.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const brands = ref([])
const toast = useToastStore()
const authStore = useAuthStore()
const loading = ref(true)

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

const totalBrands = computed(() => brands.value.length)

const fetchBrands = async () => {
  loading.value = true
  const response = await BrandService.getAllBrands()
  if (response.error) {
    console.error('Error fetching Brands:', response.error)
    loading.value = false
    return
  }
  brands.value = response.data
  loading.value = false
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

function goToAdd() {
  router.push('/brands/add')
}

function editBrand(id) {
  router.push(`/brands/${id}/edit`)
}

async function askDeleteBrand(brand) {
  brandToDelete.value = brand

  const res = await BrandService.getBrandById(brand.id)

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

  brands.value = brands.value.filter((b) => b.id !== id)
  toast.add({
    message: 'The brand has been deleted.',
    type: 'success'
  })

  brandToDelete.value = null
  showConfirm.value = false
}

onMounted(() => {
  if (authStore.user?.role !== 'SELLER') {
    toast.add({ type: 'error', message: 'Unauthorized access.' })
    router.push('/sale-items')
  }
})

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <XBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- Header Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
        <!-- Header with Gradient -->
        <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-white mb-2">
                Brand Management
              </h1>
              <p class="text-emerald-100 text-sm">
                Manage product brands and categories
              </p>
            </div>
            <div>
              <XButton
                label="Add Brand"
                variant="outline"
                size="md"
                class="itbms-add-button bg-white text-emerald-600 hover:bg-emerald-50 shadow-md transition-all duration-200 hover:shadow-lg font-semibold"
                @click="goToAdd"
              />
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="bg-gradient-to-r from-slate-50 to-emerald-50 px-8 py-4 border-b border-slate-200">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-slate-600">
                Total Brands: <span class="font-semibold text-slate-900">{{ totalBrands }}</span>
              </span>
            </div>
            <div class="w-px h-4 bg-slate-300"></div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              <span class="text-sm text-slate-600 font-medium">
                Active Management
              </span>
            </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="p-8">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div class="inline-block">
              <div class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p class="mt-4 text-slate-600 font-medium">Loading brands...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="brands.length === 0" class="text-center py-16">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
              <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-slate-800 mb-2">No brands yet</h3>
            <p class="text-slate-500 mb-6">Get started by adding your first brand</p>
            <XButton
              label="Add Your First Brand"
              variant="primary"
              size="md"
              class="itbms-add-button bg-emerald-600 hover:bg-emerald-700 text-white"
              @click="goToAdd"
            />
          </div>

          <!-- Table -->
          <div v-else class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <XTable
              :columns="columns"
              :data="brands"
            >
              <!-- ID Column with Badge -->
              <template #itbms-id="{ record }">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  #{{ record.id }}
                </span>
              </template>

              <!-- Name Column with Icon -->
              <template #itbms-name="{ record }">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span class="text-white font-bold text-sm">{{ record.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="font-medium text-slate-800">{{ record.name }}</span>
                </div>
              </template>

              <!-- Actions Column -->
              <template #actions="{ record }">
                <div class="flex space-x-2">
                  <XButton
                    label="Edit"
                    variant="outline"
                    size="xs"
                    class="itbms-edit-button hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-200"
                    @click="editBrand(record.id)"
                  />
                  <XButton
                    label="Delete"
                    variant="danger"
                    size="xs"
                    class="itbms-delete-button hover:bg-red-600 hover:shadow-md transition-all duration-200"
                    @click="askDeleteBrand(record)"
                  />
                </div>
              </template>
            </XTable>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-800 mb-1">Brand Management Tips</h3>
            <p class="text-sm text-slate-600">
              Brands with associated sale items cannot be deleted. Please remove all sale items before deleting a brand.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Modal -->
  <XConfirmModal
    v-model="showConfirm"
    title="Delete Brand"
    :message="modalMessage || `Do you want to delete ${brandToDelete?.name || ''} brand?`"
    :show-confirm="showConfirmButton"
    @confirm="confirmDeleteBrand"
  />
</template>
