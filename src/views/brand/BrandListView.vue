<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XButton from '@/components/common/XButton.vue'
import XList from '@/components/common/XList.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import { useAuthStore } from '@/stores/auth.store'
import { Tag, Info } from 'lucide-vue-next'

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
  { title: 'Actions', key: 'actions', dataIndex: 'actions', width: '300px' },
]

const totalBrands = computed(() => brands.value.length)

const headerButtons = computed(() => [
  {
    label: 'Add Brand',
    variant: 'outline',
    size: 'md',
    className:
      'itbms-add-button bg-white text-emerald-600 hover:bg-emerald-50 shadow-md transition-all duration-200 hover:shadow-lg font-semibold',
    onClick: goToAdd,
  },
])

const statsData = computed(() => [
  {
    showPulse: true,
    label: `Total Brands: <span class="font-semibold text-slate-900">${totalBrands.value}</span>`,
  },
  {
    showPulse: false,
    icon: Tag,
    label: '<span class="font-medium">Active Management</span>',
  },
])

const fetchBrands = async () => {
  loading.value = true
  const response = await BrandService.getAllBrands()
  if (response.error) {
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
  if (res.error) {
    toast.add({
      message: 'Brand not found.',
      type: 'error',
    })
    return
  }

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

  const res = await BrandService.deleteBrand(id)

  if (res.error) {
    toast.add({
      message: 'An error has occurred, the brand does not exist.',
      type: 'error',
    })
    return
  }

  brands.value = brands.value.filter((b) => b.id !== id)
  toast.add({
    message: 'The brand has been deleted.',
    type: 'success',
  })

  brandToDelete.value = null
  showConfirm.value = false
}

onMounted(() => {
  if (authStore.userInfo.role !== 'SELLER') {
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

      <XList
        title="Brand Management"
        subtitle="Manage product brands and categories"
        :buttons="headerButtons"
        :stats="statsData"
        :loading="loading"
        loading-text="Loading brands..."
        :columns="columns"
        :data="brands"
        :show-empty-state="true"
        :empty-state-icon="Info"
        empty-state-title="No brands yet"
        empty-state-description="Get started by adding your first brand"
        empty-state-button-label="Add Your First Brand"
        @empty-action="goToAdd"
      >
        <!-- ID Column with Badge -->
        <template #itbms-id="{ record }">
          <span
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
          >
            #{{ record.id }}
          </span>
        </template>

        <!-- Name Column with Icon -->
        <template #itbms-name="{ record }">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm"
            >
              <span class="text-white font-bold text-sm">{{
                record.name.charAt(0).toUpperCase()
              }}</span>
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
              class-name="itbms-edit-button hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-200"
              @click="editBrand(record.id)"
            />
            <XButton
              label="Delete"
              variant="danger"
              size="xs"
              class-name="itbms-delete-button hover:bg-red-600 hover:shadow-md transition-all duration-200"
              @click="askDeleteBrand(record)"
            />
          </div>
        </template>
      </XList>

      <!-- Info Card -->
      <div
        class="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-sm"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Info class="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-800 mb-1">
              Brand Management Tips
            </h3>
            <p class="text-sm text-slate-600">
              Brands with associated sale items cannot be deleted. Please remove all sale items
              before deleting a brand.
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
    type="error"
    :show-confirm="showConfirmButton"
    @confirm="confirmDeleteBrand"
  />
</template>
