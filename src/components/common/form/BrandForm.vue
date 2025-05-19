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
          <XButton label="Save" class="itbms-save-button" variant="primary" @click="handleSave"/>
          <XButton
            label="Cancel"
            class="itbms-cancel-button"
            variant="secondary"
            @click="$router.push('/sale-items')"
          />
        </div>
      </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useToastStore } from '@/stores/toast.store'
import { BrandService } from '@/services'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XToggle from '@/components/common/XToggle.vue'


const props = defineProps({
  initialData: Object,
  isEditMode: Boolean,
  onSubmit: Function,
})
const emit = defineEmits(['cancel'])
const toast = useToastStore()

const form = ref({
    name: '',
    websiteUrl: '',
    isActive: true,
    countryOfOrigin: ''
})

const breadcrumbs = [
  { text: 'Sale Item List', path: '/sale-items/list' },
  { text: 'Brand List', path: '/brands' },
  { text: 'New Brand', active: true },
]

const isSaving = ref(false)

const fetchBrands = async () => {
  const res = await BrandService.getAllBrands()
  if (res.error) {
    toast.add({ message: 'Failed to load brands', type: 'error' })
  } 
}

onMounted(fetchBrands)

watch(
  () => [props.initialData],
  ([val]) => {
    if (val ) {
      form.value = {
        name: val.name ?? '',
        websiteUrl: val.websiteUrl ?? '',
        isActive: val.isActive ?? true,
        countryOfOrigin: val.countryOfOrigin ?? '',
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
  if (!form.value.name) errors.push('name is required')
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
    name: form.value.name,
    websiteUrl: form.value.websiteUrl,
    isActive: form.value.isActive,
    countryOfOrigin: form.value.countryOfOrigin,
  }

  console.log('🔍 Saving payload:', payload)

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
    findBrandIdByName(initial.name) !== current.name ||
    initial.websiteUrl !== current.websiteUrl ||
    initial.isActive !== current.isActive ||
    initial.countryOfOrigin !== current.countryOfOrigin
  )
})
</script>


<style scoped>
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}
</style>

