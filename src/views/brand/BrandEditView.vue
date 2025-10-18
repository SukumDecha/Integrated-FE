<script setup>
import { useRoute, useRouter } from 'vue-router'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import BrandForm from '@/components/brand/BrandForm.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import { onMounted, ref } from 'vue'

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
    toast.add({
      message: 'The brand does not exist.',
      type: 'error',
    })
    router.push('/brands')
    return
  }

  if (res.error) {
    toast.add({
      message: 'Failed to fetch brand',
      type: 'error',
    })
    router.push('/brands')
    return
  }

  brand.value = res.data
  loading.value = false
}

const handleSubmit = async (data) => {
  const res = await BrandService.updateBrand(brandId, data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    router.push({ path: '/brands', query: { toast: 'edited' } })
  }
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
      <div v-if="loading" class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white mb-1">
                Edit Brand
              </h1>
              <p class="text-emerald-100 text-sm">
                Loading brand information...
              </p>
            </div>
          </div>
        </div>
        <div class="p-16 text-center">
          <div class="inline-block">
            <div class="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-slate-600 font-medium">Loading brand details...</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header Card -->
        <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          <!-- Header with Gradient -->
          <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-white mb-1">
                  Edit Brand
                </h1>
                <p class="text-emerald-100 text-sm">
                  Update brand information for <span class="font-semibold">{{ brand.name || `#${brandId}` }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Info Banner -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-4 border-b border-amber-100">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm text-amber-800 font-medium">
                  Make changes carefully - updating this brand will affect all associated products
                </p>
              </div>
            </div>
          </div>

          <!-- Form Container -->
          <div class="p-8">
            <BrandForm
              :initial-data="brand"
              :is-edit-mode="true"
              :on-submit="handleSubmit"
              :on-cancel="handleCancel"
            />
          </div>
        </div>

        <!-- Help Card -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-slate-800 mb-2">Editing Tips</h3>
              <ul class="text-sm text-slate-600 space-y-1">
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-1">•</span>
                  <span>Changes will be applied to all products with this brand</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-1">•</span>
                  <span>Brand name should remain unique across your inventory</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-1">•</span>
                  <span>Click "Cancel" to discard changes and return to the brand list</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
