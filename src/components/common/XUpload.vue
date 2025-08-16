<template>
  <div :class="['w-full', className]">
    <!-- Dropzone -->
    <label
      class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center cursor-pointer transition hover:border-gray-400"
      :class="isDragging ? 'border-gray-500 bg-gray-50' : 'border-gray-300'"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputEl"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        @change="onInputChange"
      >
      <div class="text-sm text-gray-600">
        <slot name="label">
          <p class="font-medium">Drop files here or click to upload</p>
          <p
            v-if="accept"
            class="text-xs text-gray-500 mt-1"
          >Accepted: {{ accept }}</p>
          <p
            v-if="maxSize"
            class="text-xs text-gray-500"
          >Max size: {{ prettyBytes(maxSize) }}</p>
        </slot>
      </div>
      <button
        type="button"
        class="mt-2 rounded-xl border px-3 py-1.5 text-sm"
        @click.prevent="open"
      >
        Browse…
      </button>
    </label>

    <!-- File list -->
    <div
      v-if="files.length"
      class="mt-4 space-y-2"
    >
      <div
        v-for="(item, index) in files"
        :key="item.id"
        class="flex items-center gap-3 rounded-xl border p-3"
        :class="item.error
          ? 'border-red-500 bg-red-50'
          : 'border-gray-200 bg-white'"
      >
        <!-- Thumbnail -->
        <div class="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
          <img
            v-if="item.previewUrl"
            :src="item.previewUrl"
            alt=""
            class="w-full h-full object-cover"
          >
          <span
            v-else
            class="text-xs text-gray-500"
          >FILE</span>
        </div>

        <!-- File info -->
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium"
            :class="item.error ? 'text-red-600' : 'text-gray-900'"
          >
            {{ item.file.name }}
          </p>
          <p class="text-xs text-gray-500">
            {{ item.file.type || '—' }} • {{ prettyBytes(item.file.size) }}
          </p>

          <!-- Error message for this file -->
          <p
            v-if="item.error"
            class="mt-1 text-xs font-medium text-red-700"
          >
            {{ item.error }}
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="text-xs rounded-lg border px-2 py-1"
            :disabled="index === 0"
            @click="moveUp(index)"
          >
            ↑
          </button>
          <button
            type="button"
            class="text-xs rounded-lg border px-2 py-1"
            :disabled="index === files.length - 1"
            @click="moveDown(index)"
          >
            ↓
          </button>
          <button
            type="button"
            class="text-xs rounded-lg border px-2 py-1"
            @click="remove(item.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>


    <!-- Helper / errors -->
    <p
      v-if="errors.length"
      class="mt-3 text-xs text-red-600"
    >
      {{ errors[errors.length - 1] }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
  maxSize: { type: Number, default: null },
  maxFiles: { type: Number, default: null },
  validators: { type: Array, default: () => [] },
  className: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

const inputEl = ref(null)
const isDragging = ref(false)
const files = ref([])
const errors = ref([])

const revokePreviewUrls = () => {
  files.value.forEach(f => {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
  })
}

onBeforeUnmount(revokePreviewUrls)

watch(
  () => props.modelValue,
  (val) => {
    const existing = new Map(files.value.map(f => [f.file, f]))
    revokePreviewUrls()
    files.value = (val || []).map(file => {
      const prev = existing.get(file)
      return {
        id: prev?.id || makeId(),
        file,
        previewUrl: isPreviewable(file) ? URL.createObjectURL(file) : null,
        error: null
      }
    })
  },
  { immediate: true }
)

function open() {
  inputEl.value && inputEl.value.click()
}

function onInputChange(e) {
  const list = Array.from(e.target.files || [])
  addFiles(list)
  e.target.value = ''
}

function onDragOver() {
  isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}
function onDrop(e) {
  isDragging.value = false
  const dt = e.dataTransfer
  const dropped = Array.from(dt?.files || [])
  addFiles(dropped)
}

function addFiles(incoming) {
  if (!incoming.length) return

  if (props.maxFiles && files.value.length + incoming.length > props.maxFiles) {
    const msg = `You can only upload up to ${props.maxFiles} file(s).`
    errors.value.push(msg)
    emit('error', msg)
    incoming = incoming.slice(0, Math.max(0, props.maxFiles - files.value.length))
  }

  const newItems = incoming.map(file => {
    const error = validateFile(file)

    if (error) {
      emit("error", error)
    }

    return {
      id: makeId(),
      file,
      previewUrl: isPreviewable(file) ? URL.createObjectURL(file) : null,
      error // keep the error even if invalid
    }
  })

  // Keep both valid & invalid files in the internal list
  files.value = props.multiple
    ? [...files.value, ...newItems]
    : [newItems[0]].filter(Boolean)

  // Only emit valid files
  emitValidFiles()
}

function remove(id) {
  const idx = files.value.findIndex(f => f.id === id)
  if (idx !== -1) {
    const [removed] = files.value.splice(idx, 1)
    if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl)
    emitValidFiles()
  }
}

function moveUp(index) {
  if (index > 0) {
    const temp = files.value[index]
    files.value[index] = files.value[index - 1]
    files.value[index - 1] = temp
    emitValidFiles()
  }
}

function moveDown(index) {
  if (index < files.value.length - 1) {
    const temp = files.value[index]
    files.value[index] = files.value[index + 1]
    files.value[index + 1] = temp
    emitValidFiles()
  }
}

function emitValidFiles() {
  const validFiles = files.value
    .filter(f => !f.error) // filter only valid
    .map(f => f.file)
  emit('update:modelValue', validFiles)
  emit('change', validFiles)
}

function validateFile(file) {
  if (props.accept && !matchesAccept(file, props.accept)) {
    return `File type not allowed (${file.type || file.name}).`
  }
  if (props.maxSize && file.size > props.maxSize) {
    return `File too large (max ${prettyBytes(props.maxSize)}).`
  }
  for (const rule of props.validators) {
    let res = null
    if (typeof rule === 'function') res = rule(file)
    else if (rule && typeof rule.validate === 'function') {
      res = rule.validate(file)
      if (res && rule.message) res = rule.message
    }
    if (res) return res
  }
  return null
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function isPreviewable(file) {
  return (file.type || '').startsWith('image/')
}

function matchesAccept(file, accept) {
  const parts = accept.split(',').map(s => s.trim()).filter(Boolean)
  const ext = file.name.includes('.') ? '.' + file.name.split('.').pop().toLowerCase() : ''
  const type = (file.type || '').toLowerCase()
  return parts.some(p => {
    p = p.toLowerCase()
    if (p === '*/*') return true
    if (p.endsWith('/*')) return type.startsWith(p.replace('/*', '') + '/')
    if (p.startsWith('.')) return ext === p
    return type === p
  })
}

function prettyBytes(num) {
  if (typeof num !== 'number' || isNaN(num)) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let n = num
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
</script>
