<template>
  <div class="min-h-screen bg-gradient-to-br">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <XBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- Header Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
        <!-- Header with Gradient -->
        <div class="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white mb-1">
                Create New Brand
              </h1>
              <p class="text-emerald-100 text-sm">
                Add a new brand to your inventory
              </p>
            </div>
          </div>
        </div>

        <!-- Info Banner -->
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-4 border-b border-emerald-100">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm text-emerald-800 font-medium">
                Complete the form below to add a new brand to your system
              </p>
            </div>
          </div>
        </div>

        <!-- Form Container -->
        <div class="p-8">
          <BrandForm
            :is-edit-mode="false"
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
            <h3 class="text-sm font-semibold text-slate-800 mb-2">Need Help?</h3>
            <ul class="text-sm text-slate-600 space-y-1">
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 mt-1">•</span>
                <span>Brand names should be unique and descriptive</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 mt-1">•</span>
                <span>You can edit or delete brands later from the brand list</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 mt-1">•</span>
                <span>Brands with associated products cannot be deleted</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import BrandForm from '@/components/brand/BrandForm.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'

const router = useRouter()
const toast = useToastStore()

const breadcrumbs = [
  { text: 'Sale Item List', path: '/sale-items/list' },
  { text: 'Brand List', path: '/brands' },
  { text: 'New Brand', active: true },
]

const handleSubmit = async (data) => {
  const res = await BrandService.createBrand(data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    router.push({ path: '/brands', query: { toast: 'created'} })
  }
}

const handleCancel = () => {
  router.push({ path: '/brands' })
}

</script>
