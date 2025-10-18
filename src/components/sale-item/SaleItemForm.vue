
<template>
  <form
    class="sale-item-form-container"
    @submit.prevent="handleSave"
  >
    <!-- Brand Section -->
    <div class="form-section">
      <div class="section-header">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <Tag class="w-5 h-5 text-white" />
          </div>
          <h3 class="section-title">Brand Information</h3>
        </div>
      </div>

      <label class="field-label">
        Brand
        <span class="text-red-500">*</span>
      </label>
      <XSelector
        v-model="form.brandId"
        class="itbms-brand"
        mode="single"
        :required="true"
        :options="brands.map((b) => ({ value: b.id, label: b.name }))"
        placeholder="Select a brand"
        :error-message="fieldErrors.brandId"
        @blur="onBlur('brandId')"
        @change="onBlur('brandId')"
      />
    </div>

    <!-- Product Details Section -->
    <div class="form-section">
      <div class="section-header">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
         <TabletSmartphone class="w-5 h-5 text-white" />
          </div>
          <h3 class="section-title">Product Details</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          v-model="form.color"
          class="itbms-color"
          label="Color"
          placeholder="e.g. Midnight Purple"
          :error-message="fieldErrors.color"
          @blur="onBlur('color')"
        />
      </div>

      <XInput
        v-model="form.description"
        class="itbms-description"
        label="Description"
        type="textarea"
        placeholder="Enter a detailed product description..."
        :required="true"
        :error-message="fieldErrors.description"
        @blur="onBlur('description')"
      />
    </div>

    <!-- Pricing & Stock Section -->
    <div class="form-section">
      <div class="section-header">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
            <BadgeDollarSign class="w-5 h-5 text-white" />
          </div>
          <h3 class="section-title">Pricing & Inventory</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <XInput
          v-model="form.price"
          class="itbms-price"
          label="Price (Baht)"
          type="number"
          placeholder="e.g. 42900"
          :required="true"
          :error-message="fieldErrors.price"
          @blur="onBlur('price')"
        />

        <XInput
          v-model="form.quantity"
          class="itbms-quantity"
          label="Quantity in Stock"
          :required="true"
          type="number"
          placeholder="e.g. 10"
          :error-message="fieldErrors.quantity"
          @blur="onBlur('quantity')"
        />
      </div>
    </div>

    <!-- Technical Specifications Section -->
    <div class="form-section">
      <div class="section-header">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <CircuitBoard class="w-5 h-5 text-white" />
          </div>
          <h3 class="section-title">Technical Specifications</h3>
        </div>
        <p class="text-xs text-slate-600 italic mb-4">Optional fields - leave blank if not applicable</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          v-model="form.storageGb"
          class="itbms-storageGb"
          label="Storage (GB)"
          type="number"
          placeholder="e.g. 128"
          :error-message="fieldErrors.storageGb"
          @blur="onBlur('storageGb')"
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
      </div>
    </div>

    <!-- Product Images Section -->
    <div class="form-section">
      <div class="section-header">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
         <Image class="w-5 h-5 text-white" />
          </div>
          <h3 class="section-title">Product Images</h3>
        </div>
        <p class="text-xs text-slate-600 italic mb-4">Upload up to 4 images (max 2MB each)</p>
      </div>

      <XUpload
        v-model="form.images"
        accept="image/*"
        :multiple="true"
        :max-slots="4"
        :max-size="2 * 1024 * 1024"
        class-name="bg-white"
        @error="onUploadImageError"
        @blur="onBlur('images')"
      />
    </div>

    <!-- Form Status Messages -->
    <div class="form-section">
      <div v-if="!isFormValid" class="flex items-center gap-3 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
        <TriangleAlert class="w-5 h-5 flex-shrink-0" />
        <span class="font-medium">Please fill in all required fields and fix any errors before saving</span>
      </div>

      <div v-else-if="!isImageChanged && !isDetailChanged && isEditMode" class="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
        <Info class="w-5 h-5 flex-shrink-0" />
        <span class="font-medium">No changes detected</span>
      </div>

      <div v-else-if="isFormValid && (isImageChanged || isDetailChanged)" class="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
        <Check class="w-5 h-5 flex-shrink-0" />
        <span class="font-medium">Form is ready to submit</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="form-section">
      <div class="flex gap-3 justify-end pt-4 border-t border-slate-200">
        <XButton
          variant="danger"
          class="itbms-cancel-button px-6 hover:shadow-lg transition-all duration-200"
          @click="emit('cancel')"
        >
          Cancel
        </XButton>

        <XButton
          type="submit"
          class="itbms-save-button px-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          :loading="isSaving"
          :disabled="!isFormValid || !(isImageChanged || isDetailChanged)"
        >
          {{ isEditMode ? 'Save Changes' : 'Create Product' }}
        </XButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import { BrandService } from '@/services'
import XInput from '@/components/common/form/XInput.vue'
import XSelector from '@/components/common/form/XSelector.vue'
import XButton from '@/components/common/XButton.vue'
import XUpload from '@/components/common/XUpload.vue'
import { parseNumber } from '@/utils/NumberUtils'
import { getImageUrl } from '@/utils'
import { Tag , TabletSmartphone , BadgeDollarSign, CircuitBoard, Image ,TriangleAlert , Info , Check } from 'lucide-vue-next'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isEditMode: Boolean,
  onSubmit: {
    type: Function,
    required: true,
  },
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
  images: [],
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
  images: '',
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
  images: false,
})

const brands = ref([])
const isSaving = ref(false)

function onBlur(field) {
  touchedFields.value[field] = true
  validateField(field)
}

function onUploadImageError(error) {
  toast.add({ message: error, type: 'error' })
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
      const len = trimmed.length
      fieldErrors.value.description =
        len < 1 || len > 16384 ? 'Description must be 1-16,384 characters long.' : ''
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
        val != null && val !== '' && (val <= 0 || !/^\d{1,2}(\.\d{1,2})?$/.test(val.toString()))
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

const fetchBrands = async () => {
  const res = await BrandService.getAllBrands()
  if (res.error) {
    toast.add({ message: 'Failed to load brands', type: 'error' })
  } else {
    brands.value = res.data

    if (props.initialData) {
      const val = props.initialData

      const imagesWithPreview =
        val.saleItemImages?.map((img) => ({
          ...img,
          fileName: img.originalFilename || img.fileName,
          previewUrl: getImageUrl(img.imageUrl),
        })) || []

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
        images: imagesWithPreview,
      }
    }
  }
}

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

const handleSave = async () => {
  Object.keys(touchedFields.value).forEach((f) => {
    touchedFields.value[f] = true
    validateField(f)
  })

  if (!isFormValid.value) {
    toast.add({ message: 'Please fix the errors in the form.', type: 'error' })
    return
  }

  const formData = new FormData()

  formData.append('brand.id', form.value.brandId)

  formData.append('model', form.value.model.trim())
  formData.append('price', form.value.price)
  formData.append('ramGb', form.value.ramGb)
  formData.append('screenSizeInch', parseNumber(form.value.screenSizeInch))
  formData.append('storageGb', form.value.storageGb)
  formData.append('color', form.value.color?.trim() || '')
  formData.append('quantity', form.value.quantity)
  formData.append('description', form.value.description.trim())

  const sortedImages = form.value.images
    .filter((img) => img.fileName)
    .filter((img) => !img.isRemoved)
    .sort((a, b) => a.order - b.order)
    .map((img, index) => ({
      ...img,
      order: index + 1,
    }))

  sortedImages.forEach((img, index) => {
    const prefix = `imageInfos[${index}]`
    formData.append(`${prefix}.order`, img.order)
    formData.append(`${prefix}.fileName`, img.fileName)

    if (img.imageFile) {
      formData.append(`${prefix}.imageFile`, img.imageFile)
    }
  })

  isSaving.value = true
  await props.onSubmit(formData)
  isSaving.value = false
}

const isDetailChanged = computed(() => {
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

const isImageChanged = computed(() => {
  if (!props.isEditMode || !props.initialData) return true

  const initialImages =
    props.initialData.saleItemImages?.map((img) => ({
      fileName: img.originalFilename,
      imageViewOrder: img.imageViewOrder,
    })) ?? []
  const currentImages =
    form.value.images?.map((img) => ({
      fileName: img.fileName,
      imageViewOrder: img.imageViewOrder,
    })) ?? []

  return JSON.stringify(initialImages) !== JSON.stringify(currentImages)
})

onMounted(fetchBrands)
</script>

<style scoped>
.sale-item-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
}

.form-section {
  background: white;
  border: none;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);  /* ← เพิ่ม shadow เบาๆ */
  transition: all 0.2s ease;
}

.form-section:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}
</style>
