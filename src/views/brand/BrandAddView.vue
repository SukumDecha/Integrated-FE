<template>
  <div class="min-h-screen bg-gradient-to-br">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <XBreadcrumb :items="breadcrumbs" />
      </div>

      <!-- ✅ ใช้ BrandForm Component -->
      <BrandForm
        :initial-data="{}"
        :is-edit-mode="false"
        :on-submit="handleSubmit"
        :on-cancel="handleCancel"
      />
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
    return
  }

  router.push({ path: '/brands', query: { toast: 'created' } })
}

const handleCancel = () => {
  router.push({ path: '/brands' })
}
</script>
