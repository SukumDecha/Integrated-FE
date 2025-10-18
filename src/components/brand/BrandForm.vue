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
  <div class="itbms-manage-brand">
    <!-- Form Container with subtle background -->
    <div class="space-y-6">
      <!-- Brand Name Field -->
      <div class="form-field-wrapper">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          <span class="form-label-enhanced">Brand Name <span class="text-red-500">*</span></span>
        </div>
        <XInput
          v-model="form.name"
          class="itbms-name"
          placeholder="Enter brand name (e.g., Apple, Samsung)"
          :error-message="touchedFields.name ? fieldErrors.name : ''"
          @blur="onBlur('name')"
        />
        <p class="form-hint">Must be between 1-30 characters</p>
      </div>

      <!-- Website URL Field -->
      <div class="form-field-wrapper">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
          </svg>
          <span class="form-label-enhanced">Website URL</span>
        </div>
        <XInput
          v-model="form.websiteUrl"
          class="itbms-websiteUrl"
          placeholder="https://www.example.com"
          :error-message="touchedFields.websiteUrl ? fieldErrors.websiteUrl : ''"
          @blur="onBlur('websiteUrl')"
        />
        <p class="form-hint">Optional - Enter the brand's official website</p>
      </div>

      <!-- Active Status Toggle -->
      <div class="form-field-wrapper">
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
          <div class="flex items-center justify-between">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-1">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <label
                  for="active"
                  class="form-label-enhanced cursor-pointer"
                >
                  Active Status
                </label>
                <p class="text-xs text-slate-600 mt-1">
                  Toggle to enable or disable this brand in your system
                </p>
              </div>
            </div>
            <XToggle
              id="active"
              v-model="form.isActive"
              class="itbms-isActive"
            />
          </div>
        </div>
      </div>

      <!-- Country of Origin Field -->
      <div class="form-field-wrapper">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="form-label-enhanced">Country of Origin</span>
        </div>
        <XInput
          v-model="form.countryOfOrigin"
          class="itbms-countryOfOrigin"
          placeholder="e.g., Japan, United States, South Korea"
          :error-message="touchedFields.countryOfOrigin ? fieldErrors.countryOfOrigin : ''"
          @blur="onBlur('countryOfOrigin')"
        />
        <p class="form-hint">Optional - Maximum 80 characters</p>
      </div>

      <!-- Action Buttons -->
      <div class="pt-6 border-t border-slate-200">
        <div class="flex gap-3">
          <XButton
            label="Save Brand"
            class="itbms-save-button"
            variant="primary"
            :disabled="!isFormValid || !isChanged"
            :loading="isSaving"
            @click="handleSave"
          />
          <XButton
            label="Cancel"
            class="itbms-cancel-button"
            variant="secondary"
            :disabled="isSaving"
            @click="props.onCancel"
          />
        </div>

        <!-- Form Status Messages -->
        <div class="mt-4 space-y-2">
          <div v-if="!isFormValid" class="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span>Please fix the errors before saving</span>
          </div>

          <div v-else-if="!isChanged && isEditMode" class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <span>No changes detected</span>
          </div>

          <div v-else-if="isFormValid && isChanged" class="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>Form is ready to submit</span>
          </div>
        </div>
      </div>
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

.form-label-enhanced {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.form-field-wrapper {
  transition: all 0.2s ease;
}

.form-field-wrapper:hover {
  transform: translateY(-1px);
}

.form-hint {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}
</style>
