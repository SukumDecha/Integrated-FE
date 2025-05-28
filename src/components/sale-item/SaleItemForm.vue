<template>
  <form @submit.prevent="handleSave" class="form-grid">
    <XSelector
      v-model="form.brandId"
      class="itbms-brand"
      label="Brand"
      mode="single"
      :required="true"
      :options="brands.map((b) => ({ value: b.id, label: b.name }))"
      placeholder="Select a brand"
      :error-message="fieldErrors.brandId"
      @blur="onBlur('brandId')"
      @change="onBlur('brandId')"
    />

    <XInput
      v-model="form.model"
      class="itbms-model"
      label="Model"
      placeholder="e.g. iPhone 14 Pro"
      :required="true"
      :error-message="fieldErrors.model"
      @blur="onBlur('model')"
    />

    <XInput
      v-model="form.price"
      class="itbms-price"
      label="Price"
      type="number"
      placeholder="e.g. 42900"
      :required="true"
      :error-message="fieldErrors.price"
      @blur="onBlur('price')"
    />

    <XInput
      v-model="form.quantity"
      class="itbms-quantity"
      label="Quantity"
      :required="true"
      type="number"
      placeholder="e.g. 10"
      :error-message="fieldErrors.quantity"
      @blur="onBlur('quantity')"
    />

    <XInput
      v-model="form.ramGb"
      class="itbms-ramGb"
      label="RAM (GB)"
      type="number"
      placeholder="e.g. 8"
      :error-message="fieldErrors.ramGb"
      @blur="onBlur('ramGb')"
    />

    <XInput
      v-model="form.screenSizeInch"
      class="itbms-screenSizeInch"
      label="Screen Size (Inch)"
      type="number"
      :step="0.1"
      placeholder="e.g. 6.7"
      :error-message="fieldErrors.screenSizeInch"
      @blur="onBlur('screenSizeInch')"
    />

    <XInput
      v-model="form.storageGb"
      class="itbms-storageGb"
      label="Storage (GB)"
      type="number"
      placeholder="e.g. 128"
      :error-message="fieldErrors.storageGb"
      @blur="onBlur('storageGb')"
    />

    <XInput
      v-model="form.color"
      class="itbms-color"
      label="Color"
      placeholder="e.g. Midnight Purple"
      :error-message="fieldErrors.color"
      @blur="onBlur('color')"
    />

    <XInput
      v-model="form.description"
      class="itbms-description"
      label="Description"
      type="textarea"
      placeholder="Short description"
      :required="true"
      :error-message="fieldErrors.description"
      @blur="onBlur('description')"
    />

    <div class="flex gap-4 justify-end mt-8">
      <XButton
        type="submit"
        class="itbms-save-button"
        :loading="isSaving"
        :disabled="!isFormValid || !isChanged"
      >
        Save
      </XButton>

      <XButton variant="danger" class="itbms-cancel-button" @click="emit('cancel')">
        Cancel
      </XButton>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import { BrandService } from '@/services'
import XInput from '@/components/common/form/XInput.vue'
import XSelector from '@/components/common/form/XSelector.vue'
import XButton from '../common/XButton.vue'

const props = defineProps({
  initialData: Object,
  isEditMode: Boolean,
  onSubmit: Function,
})

const emit = defineEmits(['cancel'])
const toast = useToastStore()

const form = ref({
  brandId: null,
  model: '',
  price: null,
  description: '',
  ramGb: null,
  screenSizeInch: null,
  storageGb: null,
  color: '',
  quantity: null,
})

const fieldErrors = ref({
  brandId: '',
  model: '',
  price: '',
  quantity: '',
  description: '',
  ramGb: '',
  screenSizeInch: '',
  storageGb: '',
})

const touchedFields = ref({
  brandId: false,
  model: false,
  price: false,
  quantity: false,
  description: false,
  ramGb: false,
  screenSizeInch: false,
  storageGb: false,
})

function onBlur(field) {
  touchedFields.value[field] = true
  validateField(field)
}

function validateField(field) {
  const val = form.value[field]

  switch (field) {
    case 'brandId':
      fieldErrors.value.brandId = !val ? 'Brand must be selected.' : ''
      break

    case 'model': {
      const raw = val ?? ''
      const trimmed = raw.trim()
      const length = trimmed.length

      fieldErrors.value.model =
        length === 0 || length > 60 ? 'Model must be 1-60 characters long.' : ''
      break
    }

    case 'price':
      fieldErrors.value.price = val == null || val < 0 ? 'Price must be non-negative integer.' : ''
      break

    case 'quantity':
      fieldErrors.value.quantity =
        val == null || val < 0 ? 'Quantity must be non-negative integer.' : ''
      break

    case 'description': {
      const trimmed = (val ?? '').trim()
      fieldErrors.value.description =
        trimmed.length === 0 ? 'Description must be 1-65,535 characters long.' : ''
      break
    }

    case 'ramGb': {
      const raw = val
      const isEmpty = raw === '' || raw === null
      const isValid = Number.isInteger(+raw) && +raw > 0

      fieldErrors.value.ramGb =
        isEmpty || isValid ? '' : 'RAM size must be positive integer or not specified.'
      break
    }

    case 'screenSizeInch':
      fieldErrors.value.screenSizeInch =
        val != null && (val <= 0 || !/^\d{1,2}(\.\d{1,2})?$/.test(val.toString()))
          ? 'Screen size must be positive number with at most 2 decimal points or not specified.'
          : ''
      break

    case 'storageGb': {
      const raw = val
      const isEmpty = raw === '' || raw === null
      const isValid = Number.isInteger(+raw) && +raw > 0

      fieldErrors.value.storageGb =
        isEmpty || isValid ? '' : 'Storage size must be positive integer or not specified.'
      break
    }

    case 'color': {
      const raw = val ?? ''
      const trimmed = raw.trim()
      const length = trimmed.length

      fieldErrors.value.color =
        length > 40 ? 'Color must be 1-40 characters long or not specified.' : ''
      break
    }
  }
}

const brands = ref([])
const isSaving = ref(false)

const fetchBrands = async () => {
  const res = await BrandService.getAllBrands()
  if (res.error) {
    toast.add({ message: 'Failed to load brands', type: 'error' })
  } else {
    brands.value = res.data

    if (props.initialData) {
      const val = props.initialData
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
  }
}

onMounted(fetchBrands)

const findBrandIdByName = (name) => {
  const found = brands.value.find((b) => b.name === name)
  return found?.id ?? ''
}

const isFormValid = computed(() => {
  const requiredFields = ['model', 'price', 'quantity', 'description']
  const hasRequiredValues = requiredFields.every((field) => {
    const val = form.value[field]
    return val !== null && val !== '' && !(typeof val === 'string' && val.trim() === '')
  })

  return (
    Object.values(fieldErrors.value).every((msg) => msg === '') &&
    form.value.brandId !== null &&
    form.value.brandId !== '' &&
    hasRequiredValues
  )
})

const parseNumber = (v) => {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

const handleSave = async () => {
  Object.keys(touchedFields.value).forEach((f) => {
    touchedFields.value[f] = true
    validateField(f)
  })

  if (!isFormValid.value) {
    toast.add({ message: 'Please fix the errors in the form.', type: 'error' })
    return
  }

  const payload = {
    brand: { id: form.value.brandId },
    model: form.value.model.trim(),
    price: form.value.price,
    ramGb: form.value.ramGb,
    screenSizeInch: parseNumber(form.value.screenSizeInch),
    storageGb: form.value.storageGb,
    color: form.value.color?.trim() || null,
    quantity: form.value.quantity,
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
  if (!props.isEditMode || !props.initialData) return true
  const current = form.value
  const initial = props.initialData
  return (
    findBrandIdByName(initial.brandName) !== current.brandId ||
    initial.model.trim() !== current.model.trim() ||
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 2fr));
  gap: 10px;
  max-width: none;
  margin: 0 auto;
}
</style>
