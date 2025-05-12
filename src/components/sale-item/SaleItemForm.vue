<template>
  <form @submit.prevent="handleSave" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="form-label">Brand <span class="text-red-500">*</span></label>
        <select v-model="form.brandId" class="input itbms-brand">
          <option disabled value="">Select a brand</option>
          <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <div>
        <label class="form-label">Model <span class="text-red-500">*</span></label>
        <input v-model="form.model" class="input itbms-model" placeholder="Model" />
      </div>

      <div>
        <label class="form-label">Price (฿) <span class="text-red-500">*</span></label>
        <input
          type="number"
          v-model.number="form.price"
          class="input itbms-price"
          placeholder="e.g. 29900"
        />
      </div>

      <div>
        <label class="form-label">Quantity <span class="text-red-500">*</span></label>
        <input
          type="number"
          v-model.number="form.quantity"
          class="input itbms-quantity"
          placeholder="e.g. 10"
          @focus="handleChange('quantity')"
        />
      </div>

      <div>
        <label class="form-label">RAM (GB)</label>
        <input
          type="number"
          v-model.number="form.ramGb"
          class="input itbms-ramGb"
          placeholder="e.g. 8"
        />
      </div>

      <div>
        <label class="form-label">Storage (GB)</label>
        <input
          type="number"
          v-model.number="form.storageGb"
          class="input itbms-storageGb"
          placeholder="e.g. 128"
        />
      </div>

      <div>
        <label class="form-label">Screen Size (inches)</label>
        <input
          type="number"
          step="0.01"
          v-model.number="form.screenSizeInch"
          class="input itbms-screenSizeInch"
          placeholder="e.g. 6.7"
        />
      </div>

      <div>
        <label class="form-label">Color</label>
        <input v-model="form.color" class="input itbms-color" placeholder="e.g. Midnight Black" />
      </div>
    </div>

    <div>
      <label class="form-label">Description <span class="text-red-500">*</span></label>
      <textarea
        v-model="form.description"
        rows="3"
        class="input itbms-description"
        placeholder="Short description of the product"
      ></textarea>
    </div>

    <div class="flex gap-2 justify-end pt-4">
      <button
        type="submit"
        class="btn-primary itbms-save-button"
        :disabled="isSaving || !isFormValid || !isChanged"
      >
        {{ isSaving ? 'Saving...' : 'Save' }}
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
        quantity: val.quantity ?? 1,
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
  if (form.value.quantity == null || form.value.quantity < 1)
    errors.push('Quantity must be at least 1')

  // Optional validations
  // if (form.value.ramGb != null && form.value.ramGb < 1) errors.push('RAM must be at least 1')
    // if (form.value.storageGb != null && form.value.storageGb < 1)
  //   errors.push('Storage must be at least 1')
  if (
    form.value.screenSizeInch != null &&
    (form.value.screenSizeInch < 0 || form.value.screenSizeInch > 99.99)
  )
    errors.push('Screen size must be 0 - 99.99')
  if (form.value.ramGb !== null && form.value.ramGb !== '' && form.value.ramGb < 1)
    errors.push('RAM must be at least 1')

  if (form.value.storageGb !== null && form.value.storageGb !== '' && form.value.storageGb < 1)
    errors.push('Storage must be at least 1')

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

const handleChange = (field) => {
  if (field === 'quantity') {
    form.value.quantity = null
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

<style scoped lang="postcss">
.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded;
}
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50;
}
.btn-secondary {
  @apply border border-gray-400 text-gray-600 px-4 py-2 rounded hover:bg-gray-100;
}
</style>
