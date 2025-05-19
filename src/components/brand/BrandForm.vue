<script setup>
import { ref, watch, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XToggle from '@/components/common/XToggle.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
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
  countryOfOrigin: ''
})

watch(
  () => props.initialData,
  (val) => {
    if (val) {
      form.value = {
        name: val.name ?? '',
        websiteUrl: val.websiteUrl ?? '',
        isActive: typeof val.isActive === 'boolean' ? val.isActive : true,
        countryOfOrigin: val.countryOfOrigin ?? ''
      }
    }
  },
  { immediate: true }
)

const isSaving = ref(false)

const isFormValid = computed(() => {
  return form.value.name && form.value.name.trim().length > 0
})

const isChanged = computed(() => {
  if (!props.isEditMode || !props.initialData || Object.keys(props.initialData).length === 0) return true

  const current = form.value
  const initial = props.initialData

  return (
    (current.name ?? '') !== (initial.name ?? '') ||
    (current.websiteUrl ?? '') !== (initial.websiteUrl ?? '') ||
    (current.isActive !== undefined ? current.isActive : true) !== (initial.isActive !== undefined ? initial.isActive : true) ||
    (current.countryOfOrigin ?? '') !== (initial.countryOfOrigin ?? '')
  )
})

const handleSave = async () => {
  if (!isFormValid.value) {
    toast.add({ message: 'Name is required', type: 'error' })
    return
  }

  const payload = {
    name: form.value.name,
    websiteUrl: form.value.websiteUrl,
    isActive: form.value.isActive,
    countryOfOrigin: form.value.countryOfOrigin,
  }

  isSaving.value = true
  await props.onSubmit(payload)
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
    />
    <XInput
      v-model="form.websiteUrl"
      class="itbms-websiteUrl"
      label="Website URL"
      placeholder="https://..."
    />
    <div class="flex items-center gap-4">
      <label for="active" class="form-label"> Active </label>
      <XToggle id="active" v-model="form.isActive" class="itbms-isActive" />
    </div>
    <XInput
      v-model="form.countryOfOrigin"
      class="itbms-countryOfOrigin"
      label="Country Of Origin"
      placeholder="e.g. Japan"
    />
    <div class="flex gap-2 pt-4">
      <XButton
        label="Save"
        class="itbms-save-button"
        variant="primary"
        @click="handleSave"
        :disabled="!isFormValid || !isChanged"
      />
      <XButton
        label="Cancel"
        class="itbms-cancel-button"
        variant="secondary"
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
