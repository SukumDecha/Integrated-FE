<template>
  <form @submit.prevent="handleSave" class="form-grid">
    <XSelector
      v-model="form.brandId"
      class="itbms-brand"
      label="Brand"
      :required="true"
      :options="brands.map((b) => ({ value: b.id, label: b.name }))"
      placeholder="Select a brand"
    />

    <XInput
      v-model="form.model"
      class="itbms-model"
      label="Model"
      placeholder="e.g. iPhone 14 Pro"
      :required="true"
    />

    <XInput
      v-model="form.price"
      class="itbms-price"
      label="Price (฿)"
      type="number"
      placeholder="e.g. 42900"
      :required="true"
    />

    <XInput
      v-model="form.quantity"
      class="itbms-quantity"
      label="Quantity"
      :required="true"
      type="number"
      placeholder="e.g. 10"
    />

    <XInput
      v-model="form.ramGb"
      class="itbms-ramGb"
      label="RAM (GB)"
      type="number"
      placeholder="e.g. 8"
    />

    <XInput
      v-model="form.screenSizeInch"
      class="itbms-screenSizeInch"
      label="Screen Size (Inch)"
      type="number"
      :step="0.1"
      placeholder="e.g. 6.7"
    />

    <XInput
      v-model="form.storageGb"
      class="itbms-storageGb"
      label="Storage (GB)"
      type="number"
      placeholder="e.g. 128"
    />

    <XInput
      v-model="form.color"
      class="itbms-color"
      label="Color"
      placeholder="e.g. Midnight Purple"
    />

    <XInput
      v-model="form.description"
      class="itbms-description"
      label="Description"
      type="textarea"
      placeholder="Short description"
      :required="true"
    />

    <div class="flex gap-4 justify-end mt-8">
      <button
        type="submit"
        class="btn-primary itbms-save-button"
        :disabled="!isFormValid || !isChanged"
      >
        Save
      </button>

      <button type="button" class="btn-secondary itbms-cancel-button" @click="emit('cancel')">
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import { BrandService } from '@/services'
import XInput from '@/components/common/form/XInput.vue'
import XSelector from '@/components/common/form/XSelector.vue'

const props = defineProps({
  initialData: Object,
  isEditMode: Boolean,
  onSubmit: Function,
})
const emit = defineEmits(['cancel'])
const toast = useToastStore()

const form = ref({
  brandId: '',
  model: '',
  price: null,
  description: '',
  ramGb: null,
  screenSizeInch: null,
  storageGb: null,
  color: '',
  quantity: null,
})

const brands = ref([])
const isSaving = ref(false)

const fetchBrands = async () => {
  const res = await BrandService.getAllBrands()
  if (res.error) {
    toast.add({ message: 'Failed to load brands', type: 'error' })
  } else {
    brands.value = res.data
  }
}

onMounted(fetchBrands)

watch(
  () => [props.initialData, brands.value],
  ([val, loadedBrands]) => {
    if (val && loadedBrands.length > 0) {
      form.value = {
        brandId: findBrandIdByName(val.brandName),
        model: val.model ?? '',
        price: val.price ?? null,
        description: val.description ?? '',
        ramGb: val.ramGb ?? null,
        screenSizeInch: val.screenSizeInch ?? null,
        storageGb: val.storageGb ?? null,
        color: val.color ?? '',
        quantity: val.quantity ?? null,
      }
    }
  },
  { immediate: true },
)

const findBrandIdByName = (name) => {
  const found = brands.value.find((b) => b.name === name)
  return found?.id ?? ''
}

const isFormValid = computed(() => {
  const result = validate()
  console.log('🔍 validate result:', result)
  return validate().length === 0
})

const validate = () => {
  const errors = []

  // Required fields
  if (!form.value.brandId) errors.push('Brand is required')
  if (!form.value.model?.trim()) {
    errors.push('Model is required')
  } else if (form.value.model.trim().length > 60) {
    errors.push('Model must be at most 60 characters')
  }
  if (form.value.price == null || form.value.price < 0) errors.push('Price must be 0 or more')
  if (!form.value.description?.trim()) errors.push('Description is required')
  
  if (
    form.value.screenSizeInch != null &&
    (form.value.screenSizeInch < 0 || form.value.screenSizeInch > 99.99)
  )
    errors.push('Screen size must be 0 - 99.99', form.value.screenSizeInch)
  if (form.value.ramGb !== null && form.value.ramGb !== '' && form.value.ramGb < 1)
    errors.push('RAM must be at least 1', form.value.ramGb)

  if (form.value.storageGb !== null && form.value.storageGb !== '' && form.value.storageGb < 1)
    errors.push('Storage must be at least 1', form.value.storageGb)

  return errors
}

const handleSave = async () => {
  const validationErrors = validate()
  if (validationErrors.length > 0) {
    console.log('🔥 Showing toast:', validationErrors[0])
    toast.add({ message: `⚠️ ${validationErrors[0]}`, type: 'error' })
    return
  }

  const payload = {
    brand: { id: form.value.brandId },
    model: form.value.model.trim(),
    price: form.value.price,
    ramGb: form.value.ramGb,
    screenSizeInch: form.value.screenSizeInch,
    storageGb: form.value.storageGb,
    color: form.value.color?.trim() || null,
    quantity: form.value.quantity || 1,
    description: form.value.description.trim(),
  }

  isSaving.value = true
  try {
    await props.onSubmit(payload)
  } catch (err) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

const isChanged = computed(() => {
  if (!props.isEditMode || !props.initialData) return true // always enabled in Add

  const current = form.value
  const initial = props.initialData

  return (
    findBrandIdByName(initial.brandName) !== current.brandId ||
    initial.model !== current.model ||
    initial.price !== current.price ||
    initial.description !== current.description ||
    initial.ramGb !== current.ramGb ||
    initial.screenSizeInch !== current.screenSizeInch ||
    initial.storageGb !== current.storageGb ||
    (initial.color ?? '') !== current.color ||
    initial.quantity !== current.quantity
  )
})
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 2fr)); /* ปรับให้แต่ละคอลัมน์มีขนาดขั้นต่ำ และขยายได้ */
  gap: 10px; /* เพิ่มระยะห่างระหว่างช่อง */
  max-width: none;
  margin: 0 auto;
}
</style>

