<template>
  <form class="form-grid" @submit.prevent="handleSave">
    <label class="block text-sm font-medium text-gray-700 mb-1">
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

    <div class="flex gap-4 justify-end mt-8">
      <XButton
        type="submit"
        class="itbms-save-button"
        :loading="isSaving"
        :disabled="!isFormValid || !(isImageChanged || isDetailChanged)"
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
import XButton from '@/components/common/XButton.vue'
import XUpload from '@/components/common/XUpload.vue'
import { parseNumber } from '@/utils/NumberUtils'
import { getImageUrl } from '@/utils'

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
const storageOptions = ref([])
const isSaving = ref(false)

function onBlur(field) {
  touchedFields.value[field] = true
  validateField(field)
}

function onUploadImageError(error) {
  fieldErrors.value.images = error
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

const fetchBrands = async () => {
  const res = await BrandService.getAllBrands()
  if (res.error) {
    toast.add({ message: 'Failed to load brands', type: 'error' })
  } else {
    brands.value = res.data

    if (props.initialData) {
      const val = props.initialData

      console.log('initial val', val)
      const imagesWithPreview =
        val.saleItemImages?.map((img) => ({
          ...img,
          previewUrl: getImageUrl(img.imageUrl), // assuming the backend returns a 'url' for the image
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

      console.log('Form.value', form.value)
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

  // Scalars
  formData.append('model', form.value.model.trim())
  formData.append('price', form.value.price)
  formData.append('ramGb', form.value.ramGb)
  formData.append('screenSizeInch', parseNumber(form.value.screenSizeInch))
  formData.append('storageGb', form.value.storageGb)
  formData.append('color', form.value.color?.trim() || '')
  formData.append('quantity', form.value.quantity)
  formData.append('description', form.value.description.trim())

  const sortedImages = form.value.images
    .filter((img) => img.fileName) // remove empty images
    .sort((a, b) => a.order - b.order) // sort by existing order
    .map((img, index) => ({
      // reassign consecutive order numbers
      ...img,
      order: index + 1,
    }))

  // ImageInfos (list of objects)
  sortedImages.forEach((img, index) => {
    const prefix = `imageInfos[${index}]`
    formData.append(`${prefix}.order`, img.order)
    formData.append(`${prefix}.fileName`, img.fileName)
    // formData.append(`${prefix}.status`, img.status)

    if (img.imageFile) {
      formData.append(`${prefix}.imageFile`, img.imageFile)
    }
  })

  // for (const [key, value] of formData.entries()) {
  //   console.log(key, value)
  // }

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
      fileName: img.fileName,
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 2fr));
  gap: 10px;
  max-width: none;
  margin: 0 auto;
}
</style>
