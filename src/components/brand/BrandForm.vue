<script setup>
import { ref, watch, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XToggle from '@/components/common/form/XToggle.vue'
import XCard from '@/components/common/XCard.vue'
import { Tag, Globe, Earth, Info, ShieldCheck, BadgeAlert, Plus, NotebookPen, CircleAlert } from 'lucide-vue-next'

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
  brandId: {
    type: [String, Number],
    default: null,
  },
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
    <!-- Header Card with Form -->
    <XCard>
      <!-- Custom Header -->
      <template #header>
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
          >
            <Plus v-if="!isEditMode" class="w-8 h-8 text-white" />
            <NotebookPen v-else class="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white mb-1">
              {{ isEditMode ? 'Edit Brand' : 'Create New Brand' }}
            </h1>
            <p class="text-emerald-100 text-sm">
              <template v-if="isEditMode">
                Update brand information for
                <span class="font-semibold">
                  {{ initialData.name || `#${brandId}` }}
                </span>
              </template>
              <template v-else>
                Add a new brand to your inventory
              </template>
            </p>
          </div>
        </div>
      </template>

      <!-- Info Banner (Using stats slot) -->
      <template #stats>
        <div class="flex items-start gap-3 w-full">
          <div class="flex-shrink-0 mt-0.5">
            <Info :class="isEditMode ? 'w-5 h-5 text-amber-600' : 'w-5 h-5 text-emerald-600'" />
          </div>
          <div>
            <p :class="isEditMode ? 'text-sm text-amber-800 font-medium' : 'text-sm text-emerald-800 font-medium'">
              <template v-if="isEditMode">
                Make changes carefully - updating this brand will affect all associated products
              </template>
              <template v-else>
                Complete the form below to add a new brand to your system
              </template>
            </p>
          </div>
        </div>
      </template>

      <!-- Form Content -->
      <div class="space-y-6">
        <!-- Brand Name Field -->
        <div class="form-field-wrapper">
          <div class="flex items-center gap-2 mb-2">
            <Tag class="w-5 h-5 text-emerald-600" name="brand" />
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
            <Globe class="w-5 h-5 text-emerald-600" />
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
                  <Earth class="w-5 h-5 text-emerald-600" />
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
            <Earth class="w-5 h-5 text-emerald-600" />
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
              <BadgeAlert class="w-4 h-4 flex-shrink-0" />
              <span>Please fix the errors before saving</span>
            </div>

            <div v-else-if="!isChanged && isEditMode" class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Info class="w-4 h-4 flex-shrink-0" />
              <span>No changes detected</span>
            </div>

            <div v-else-if="isFormValid && isChanged" class="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <ShieldCheck class="w-4 h-4 flex-shrink-0" />
              <span>Form is ready to submit</span>
            </div>
          </div>
        </div>
      </div>
    </XCard>

    <!-- Help Card -->
    <XCard :show-header="false" :show-stats="false">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <div
            class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm"
          >
            <CircleAlert class="w-5 h-5 text-white" />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-slate-800 mb-2">
            {{ isEditMode ? 'Editing Tips' : 'Need Help?' }}
          </h3>
          <ul class="text-sm text-slate-600 space-y-1">
            <template v-if="isEditMode">
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 mt-1">•</span>
                <span>Changes will be applied to all products with this brand</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 mt-1">•</span>
                <span>Brand name should remain unique across your inventory</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 mt-1">•</span>
                <span>Click "Cancel" to discard changes and return to the brand list</span>
              </li>
            </template>
            <template v-else>
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
            </template>
          </ul>
        </div>
      </div>
    </XCard>
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
