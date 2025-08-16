<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: [String, Number, Array],
  mode: { type: String, default: 'single' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'remove', 'blur', 'change'])

const isMultiple = computed(() => props.mode === 'multiple')
const search = ref('')
const isOpen = ref(false)
const inputRef = ref(null)
const wrapperRef = ref(null)

const selectedValue = computed({
  get() {
    return isMultiple.value
      ? Array.isArray(props.modelValue)
        ? props.modelValue
        : []
      : (props.modelValue ?? '')
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const filteredOptions = computed(() => {
  return props.options.filter((o) =>
    isMultiple.value
      ? !selectedValue.value.includes(o.value) &&
        o.label.toLowerCase().includes(search.value.toLowerCase())
      : o.label.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const selectedLabels = computed(() => {
  return isMultiple.value
    ? props.options.filter((o) => selectedValue.value.includes(o.value))
    : props.options.find((o) => o.value === selectedValue.value)
})

const addOption = (value) => {
  if (isMultiple.value) {
    if (!selectedValue.value.includes(value)) {
      emit('update:modelValue', [...selectedValue.value, value])
      search.value = ''
    }
  } else {
    emit('update:modelValue', value)
    emit('change') // ✅ trigger validateField ตอนเลือก
    isOpen.value = false
  }
}

const removeOption = (value) => {
  if (isMultiple.value) {
    emit(
      'update:modelValue',
      selectedValue.value.filter((v) => v !== value),
    )
    emit('remove', value)
  } else {
    emit('update:modelValue', '')
  }
}

const handleFocus = () => {
  isOpen.value = true
}

const handleClickOutside = (e) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="relative w-full"
  >
    <!-- Multiple Mode -->
    <div
      v-if="isMultiple"
      class="flex flex-wrap items-center gap-1 px-3 py-2 border rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500"
      :class="props.class"
      @click="() => inputRef?.focus()"
    >
      <div
        v-for="item in selectedLabels"
        :key="item.value"
        class="itbms-filter-item bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-sm flex items-center gap-1"
      >
        {{ item.label }}
        <button
          type="button"
          class="itbms-filter-item-clear"
          @click.stop="removeOption(item.value)"
        >
          ×
        </button>
      </div>

      <input
        ref="inputRef"
        v-model="search"
        type="text"
        :placeholder="selectedLabels.length === 0 ? placeholder : ''"
        class="flex-1 border-none focus:ring-0 focus:outline-none min-w-[50px]"
        :disabled="disabled"
        @focus="handleFocus"
      >
    </div>

    <!-- Single Mode -->
    <div
      v-else
      class="px-3 py-2 border rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500"
    >
      <select
        v-model="selectedValue"
        :disabled="disabled"
        :class="['w-full bg-white outline-none', props.class]"
        @blur="$emit('blur')"
        @change="$emit('change')"
      >
        <option
          value=""
        >
          {{ placeholder || 'Select an option' }}
        </option>
        <option
          v-for="option in props.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <!-- ✅ Show error -->
    <p
      v-if="props.errorMessage"
      class="itbms-message text-sm text-red-600 mt-1"
    >
      {{ props.errorMessage }}
    </p>

    <!-- Dropdown for multiple -->
    <ul
      v-if="isMultiple && isOpen && filteredOptions.length"
      class="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      <li
        v-for="option in filteredOptions"
        :key="option.value"
        class="itbms-filter-item px-4 py-2 hover:bg-blue-100 cursor-pointer"
        @mousedown.prevent="addOption(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>
