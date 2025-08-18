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

const breadcrumbs = [
  { text: 'Sale Item List', path: '/sale-items/list' },
  { text: 'Brand List', path: '/brands' },
  { text: `Edit #${brandId}`, active: true },
]

const fetchBrand = async () => {
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
}

const handleSubmit = async (data) => {
  const res = await BrandService.updateBrand(brandId, data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    router.push({ path: '/brands', query: { toast: 'edited' } }) // ✅ Redirect พร้อม toast
  }
}

const handleCancel = () => {
  router.push({ path: '/brands' })
}

onMounted(fetchBrand)
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <BrandForm
    :initial-data="brand"
    :is-edit-mode="true"
    :on-submit="handleSubmit"
    :on-cancel="handleCancel"
  />
</template>
