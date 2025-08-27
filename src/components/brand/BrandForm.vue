<script setup>
import { ref, watch, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XToggle from '@/components/common/form/XToggle.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  onSubmit: Function,
  onCancel: Function,
})

const toast = useToastStore()

const form = ref({
  name: '',
  websiteUrl: '',
  isActive: true,
  countryOfOrigin: '',
})

const fieldErrors = ref({
  name: '',
  websiteUrl: '',
  countryOfOrigin: '',
})

const touchedFields = ref({
  name: false,
  websiteUrl: false,
  countryOfOrigin: false,
})

const onBlur = (field) => {
  touchedFields.value[field] = true
  fieldErrors.value[field] = validateField(field, form.value[field])
}

function isValidURL(url) {
  try {
    if (!url.trim()) return true
    new URL(url.trim())
    return true
  } catch {
    return false
  }
}

function validateField(field, value) {
  switch (field) {
    case 'name': {
      const trimmed = value?.trim() ?? ''
      const len = trimmed.length
      if (len < 1 || len > 30) return 'Brand name must be 1-30 characters long.'
      return ''
    }

    case 'countryOfOrigin': {
      const len = value?.trim().length ?? 0
      if (len > 80) return 'Brand country of origin must be 1-80 characters long or not specified.'
      return ''
    }
    case 'websiteUrl':
      return isValidURL(value ?? '') ? '' : 'Brand URL must be a valid URL or not specified.'
    default:
      return ''
  }
}

watch(
  () => props.initialData,
  (val) => {
    if (val) {
      form.value = {
        name: val.name ?? '',
        websiteUrl: val.websiteUrl ?? '',
        isActive: typeof val.isActive === 'boolean' ? val.isActive : true,
        countryOfOrigin: val.countryOfOrigin ?? '',
      }
    }
  },
  { immediate: true },
)

watch(
  form,
  (newVal) => {
    Object.keys(newVal).forEach((field) => {
      if (touchedFields.value[field]) {
        fieldErrors.value[field] = validateField(field, newVal[field])
      }
    })
  },
  { deep: true },
)

const isSaving = ref(false)

const isFormValid = computed(() => {
  return (
    validateField('name', form.value.name) === '' &&
    validateField('websiteUrl', form.value.websiteUrl) === '' &&
    validateField('countryOfOrigin', form.value.countryOfOrigin) === ''
  )
})

const isChanged = computed(() => {
  if (!props.isEditMode || !props.initialData || Object.keys(props.initialData).length === 0)
    return true

  const current = form.value
  const initial = props.initialData

  return (
    (current.name ?? '') !== (initial.name ?? '') ||
    (current.websiteUrl ?? '') !== (initial.websiteUrl ?? '') ||
    (current.isActive !== undefined ? current.isActive : true) !==
      (initial.isActive !== undefined ? initial.isActive : true) ||
    (current.countryOfOrigin ?? '') !== (initial.countryOfOrigin ?? '')
  )
})

const handleSave = async () => {
  Object.keys(touchedFields.value).forEach((k) => {
    touchedFields.value[k] = true
    fieldErrors.value[k] = validateField(k, form.value[k])
  })

  if (!isFormValid.value) {
    toast.add({ message: 'Please fix the errors in the form.', type: 'error' })
    return
  }

  const payload = {
    name: form.value.name.trim(),
    websiteUrl: form.value.websiteUrl.trim(),
    isActive: form.value.isActive,
    countryOfOrigin: form.value.countryOfOrigin.trim(),
  }

  isSaving.value = true
  await props.onSubmit(payload)
  isSaving.value = false
}
</script>

<template>
  <div class="itbms-manage-brand space-y-4 p-4 bg-white rounded-lg shadow">
    <XInput
      v-model="form.name"
      class="itbms-name"
      label="Name"
      required
      placeholder="Enter brand name"
      :error-message="touchedFields.name ? fieldErrors.name : ''"
      @blur="onBlur('name')"
    />

    <XInput
      v-model="form.websiteUrl"
      class="itbms-websiteUrl"
      label="Website URL"
      placeholder="https://..."
      :error-message="touchedFields.websiteUrl ? fieldErrors.websiteUrl : ''"
      @blur="onBlur('websiteUrl')"
    />

    <div class="flex items-center gap-4">
      <label
        for="active"
        class="form-label"
      > Active </label>
      <XToggle
        id="active"
        v-model="form.isActive"
        class="itbms-isActive"
      />
    </div>

    <XInput
      v-model="form.countryOfOrigin"
      class="itbms-countryOfOrigin"
      label="Country Of Origin"
      placeholder="e.g. Japan"
      :error-message="touchedFields.countryOfOrigin ? fieldErrors.countryOfOrigin : ''"
      @blur="onBlur('countryOfOrigin')"
    />

    <div class="flex gap-2 pt-4">
      <XButton
        label="Save"
        class="itbms-save-button"
        variant="primary"
        :disabled="!isFormValid || !isChanged"
        @click="handleSave"
      />
      <XButton
        label="Cancel"
        class="itbms-cancel-button"
        variant="secondary"
        :loading="isSaving"
        @click="props.onCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}
</style>
