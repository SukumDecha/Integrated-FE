<script setup>
import { useRoute, useRouter } from 'vue-router'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import BrandForm from '@/components/brand/BrandForm.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XCard from '@/components/common/XCard.vue'
import { onMounted, ref } from 'vue'
import { NotebookPen } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const brandId = route.params.id
const brand = ref({})
const loading = ref(true)

const breadcrumbs = [
  { text: 'Sale Item List', path: '/sale-items/list' },
  { text: 'Brand List', path: '/brands' },
  { text: `Edit #${brandId}`, active: true },
]

const fetchBrand = async () => {
  loading.value = true
  const res = await BrandService.getBrandById(brandId)

  const errorMessage = typeof res.error?.message === 'string' ? res.error.message : ''
  const isNotFound = errorMessage.includes('404')

  if (isNotFound) {
    toast.add({ message: 'The brand does not exist.', type: 'error' })
    router.push('/brands')
    return
  }

  if (res.error) {
    toast.add({ message: 'Failed to fetch brand', type: 'error' })
    router.push('/brands')
    return
  }

  brand.value = res.data
  loading.value = false
}

const handleSubmit = async (data) => {
  const res = await BrandService.updateBrand(brandId, data)

  if (res?.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    return
  }

  router.push({ path: '/brands', query: { toast: 'edited' } })
}

const handleCancel = () => {
  router.push({ path: '/brands' })
}

onMounted(fetchBrand)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <XBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- Loading State -->
      <XCard
        v-if="loading"
        title="Edit Brand"
        subtitle="Loading brand information..."
      >
        <template #header>
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
            >
              <NotebookPen class="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white mb-1">Edit Brand</h1>
              <p class="text-emerald-100 text-sm">
                Loading brand information...
              </p>
            </div>
          </div>
        </template>

        <div class="text-center py-8">
          <div class="inline-block">
            <div
              class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"
            ></div>
            <p class="mt-4 text-slate-600 font-medium">
              Loading brand details...
            </p>
          </div>
        </div>
      </XCard>

      <!-- Content -->
      <div v-else>
        <BrandForm
          :initial-data="brand"
          :is-edit-mode="true"
          :on-submit="handleSubmit"
          :on-cancel="handleCancel"
          :brand-id="brandId"
        />
      </div>
    </div>
  </div>
</template>
