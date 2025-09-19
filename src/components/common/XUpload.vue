<template>
  <div class="flex flex-col ">
    <label
      v-if="label"
      class="mb-1 text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
    </label>

    <div :class="['w-full', className]">
      <!-- Dropzone -->
      <label
        class="itbms-upload-button flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center cursor-pointer transition hover:border-gray-400"
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
            <p
              v-if="maxSlots"
              class="text-xs text-gray-500"
            >
              Slots: {{ occupiedSlots }}/{{ maxSlots }}
            </p>
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

      <!-- File slots grid -->
      <div
        v-if="maxSlots"
        class="mt-4 grid gap-2"
        :class="[
          maxSlots === 1 && occupiedSlots > 0 ? '' : 'mt-4 grid',
          maxSlots === 1 ? 'w-64 h-64' : gridClass
        ]"
      >
        <div
          v-for="slotIndex in maxSlots"
          :key="`slot-${slotIndex}-${getSlotFile(slotIndex - 1)?.id}-${getSlotFile(slotIndex - 1)?.isRemoved}`"
          class="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group"
          :class="[
            getSlotFile(slotIndex - 1)
              ? 'border-solid border-gray-300 bg-white'
              : 'hover:border-gray-300',
            dropTargetSlotIndex === slotIndex - 1 && draggedSlotIndex !== null
              ? 'border-blue-400 bg-blue-50'
              : '',
          ]"
        >
          <!-- File content -->
          <template v-if="getSlotFile(slotIndex - 1)">
            <div
              class="w-full h-full relative cursor-move"
              draggable="true"
              @dragstart="onFileDragStart($event, slotIndex - 1)"
              @dragend="onFileDragEnd"
            >
              <!-- Image preview -->
              <img
                v-if="getSlotFile(slotIndex - 1).previewUrl"
                :src="getSlotFile(slotIndex - 1).previewUrl"
                :alt="getSlotFile(slotIndex - 1).fileName"
                class="w-full h-full object-cover transition"
                :class="getSlotFile(slotIndex - 1).isRemoved ? 'opacity-40 grayscale' : ''"
              >

              <!-- File icon for non-images -->
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-gray-500"
                :class="getSlotFile(slotIndex - 1).isRemoved ? 'opacity-40 grayscale' : ''"
              >
                <span class="text-xs font-medium mb-1">FILE</span>
                <span class="text-xs truncate px-2">{{ getSlotFile(slotIndex - 1).fileName }}</span>
              </div>

              <!-- Overlay เมื่อถูก mark ลบ (Fixed) -->
              <div
                v-show="getSlotFile(slotIndex - 1)?.isRemoved === true"
                class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                style="z-index: 10"
              >
                <div class="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                  Marked for Delete
                </div>
              </div>

              <!-- File info overlay -->
              <div
                class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style="z-index: 5"
              >
                <p
                  class="text-xs truncate font-medium"
                  :class="`itbms-picture-file${slotIndex}`"
                >
                  {{ getSlotFile(slotIndex - 1).fileName }}
                </p>
                <p class="text-xs text-gray-300">
                  {{ getSlotFile(slotIndex - 1).imageFile?.type || '—' }} •
                  {{ prettyBytes(getSlotFile(slotIndex - 1).imageFile?.size) }}
                </p>
              </div>

              <!-- Error indicator -->
              <div
                v-if="getSlotFile(slotIndex - 1).error"
                class="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center"
                style="z-index: 8"
              >
                <div class="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Error
                </div>
              </div>

              <!-- Action buttons -->
              <div
                class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style="z-index: 15"
              >
                <!-- Move left -->
                <button
                  v-if="slotIndex > 1 && canMoveLeft(slotIndex - 1)"
                  type="button"
                  class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  :class="`itbms-picture-file${slotIndex}-up`"
                  title="Move left"
                  @click="moveSlotLeft(slotIndex - 1)"
                >
                  ←
                </button>
                <!-- Move right -->
                <button
                  v-if="slotIndex < maxSlots && canMoveRight(slotIndex - 1)"
                  type="button"
                  class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  :class="`itbms-picture-file${slotIndex}-down`"
                  title="Move right"
                  @click="moveSlotRight(slotIndex - 1)"
                >
                  →
                </button>
                <!-- Remove -->
                <button
                  type="button"
                  class="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  :class="`itbms-picture-file${slotIndex}-clear`"
                  :title="getSlotFile(slotIndex - 1).isRemoved ? 'Restore' : 'Remove'"
                  @click="toggleRemove(slotIndex - 1)"
                >
                  ×
                </button>
              </div>
            </div>
          </template>

          <!-- Empty slot with drop target -->
          <template v-else>
            <div
              class="text-gray-400 text-center h-full w-full flex flex-col items-center justify-center"
              @dragover.prevent="onSlotDragOver($event, slotIndex - 1)"
              @dragleave.prevent="onSlotDragLeave"
              @drop.prevent="onSlotDrop($event, slotIndex - 1)"
            >
              <div class="text-2xl mb-1">
                +
              </div>
              <div class="text-xs">
                Slot {{ slotIndex }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Traditional file list (when not using slots) -->
      <div
        v-else-if="files.length"
        class="mt-4 space-y-2"
      >
        <div
          v-for="(item, index) in files"
          :key="item.id"
          class="flex items-center gap-3 rounded-xl border p-3"
          :class="item.error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'"
        >
          <!-- Thumbnail -->
          <div
            class="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center shrink-0"
          >
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
              :class="[
                'truncate text-sm font-medium',
                item.error ? 'text-red-600' : 'text-gray-900',
                `itbms-picture-file${index + 1}`,
              ]"
            >
              {{ item.fileName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ item.imageFile?.type || '—' }} • {{ prettyBytes(item.imageFile?.size) }}
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
          <div
            v-if="files.length > 1"
            class="flex items-center gap-1"
          >
            <button
              v-if="index !== 0"
              type="button"
              class="text-xs rounded-lg border px-2 py-1 hover:bg-green-50 hover:border-green-400 hover:text-green-400"
              :class="`itbms-picture-file${index + 1}-up`"
              :disabled="index === 0"
              @click="moveUp(index)"
            >
              ↑
            </button>
            <button
              v-if="index !== files.length - 1"
              type="button"
              class="text-xs rounded-lg border px-2 py-1 hover:bg-green-50 hover:border-green-400 hover:text-green-400"
              :class="`itbms-picture-file${index + 1}-down`"
              :disabled="index === files.length - 1"
              @click="moveDown(index)"
            >
              ↓
            </button>
            <button
              type="button"
              class="group text-xs rounded-lg border px-2 py-1 hover:bg-red-50 hover:border-red-400"
              :class="`itbms-picture-file${index + 1}-clear`"
              @click="remove(item.id)"
            >
              <TrashIcon class="h-4 w-4 text-gray-500 group-hover:text-red-400" />
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
  </div>
</template>

<script setup>
import { TrashIcon } from 'lucide-vue-next'
import { ref, watch, onBeforeUnmount, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: null},
  required: { type: Boolean, default: false },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
  maxSize: { type: Number, default: null },
  maxFiles: { type: Number, default: null },
  maxSlots: { type: Number, default: null }, // New prop for slot-based upload
  validators: { type: Array, default: () => [] },
  className: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'change', 'error', 'removed'])

const inputEl = ref(null)
const isDragging = ref(false)
const files = ref([])
const errors = ref([])
const draggedSlotIndex = ref(null)
const dropTargetSlotIndex = ref(null)

// Computed property for grid layout based on slot count
const gridClass = computed(() => {
  if (!props.maxSlots) return 'grid-cols-1'
  if (props.maxSlots <= 2) return 'grid-cols-2'
  if (props.maxSlots <= 4) return 'grid-cols-2 sm:grid-cols-4'
  if (props.maxSlots <= 6) return 'grid-cols-2 sm:grid-cols-3'
  return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
})

// Computed property to count occupied slots
const occupiedSlots = computed(() => {
  return files.value.filter((f) => f && !f.error).length
})

const revokePreviewUrls = () => {
  files.value.forEach((f) => {
    if (f && f.previewUrl) URL.revokeObjectURL(f.previewUrl)
  })
}

onBeforeUnmount(revokePreviewUrls)

watch(
  () => props.modelValue,
  (val) => {
    if (props.maxSlots) {
      // Initialize slots array with null values
      const newFiles = new Array(props.maxSlots).fill(null)

      // Fill slots with existing files, maintaining their positions
      ;(val || []).forEach((item) => {
        const slotIndex =
          item.slotIndex !== undefined ? item.slotIndex : findNextEmptySlot(newFiles)
        if (slotIndex !== -1 && slotIndex < props.maxSlots) {
          const isFile = item.imageFile instanceof File

          let previewUrl = null

          if (item.previewUrl) {
            previewUrl = item.previewUrl
          } else if (isFile && isPreviewable(item.imageFile)) {
            previewUrl = URL.createObjectURL(item.imageFile)
          }

          newFiles[slotIndex] = {
            id: item.id || makeId(),
            imageFile: isFile ? item.imageFile : null,
            fileName: item.originalFilename || item.fileName,
            slotIndex,
            previewUrl,
            error: null,
            isRemoved: item.isRemoved || false, // รับค่า isRemoved จาก parent
          }
        }
      })

      files.value = newFiles
    } else {
      // Original behavior for non-slot mode
      files.value = (val || []).map((item) => {
        const isFile = item.imageFile instanceof File

        let previewUrl = null
        if (item.previewUrl) {
          previewUrl = item.previewUrl
        } else if (isFile && isPreviewable(item.imageFile)) {
          previewUrl = URL.createObjectURL(item.imageFile)
        }

        return {
          id: item.id || makeId(),
          imageFile: isFile ? item.imageFile : null,
          fileName: item.fileName || item.name,
          previewUrl,
          error: null,
          isRemoved: item.isRemoved || false,
        }
      })
    }
  },
  { immediate: true },
)

function findNextEmptySlot(slotsArray) {
  for (let i = 0; i < slotsArray.length; i++) {
    if (!slotsArray[i]) return i
  }
  return -1
}

function getSlotFile(slotIndex) {
  if (!props.maxSlots) return null
  return files.value[slotIndex] || null
}

const removedFiles = ref([])

function toggleRemove(slotIndex) {
  const file = files.value[slotIndex]
  if (!file) return

  // สร้าง array ใหม่ทั้งหมดเพื่อให้ Vue detect การเปลี่ยนแปลง
  const newFiles = [...files.value]
  newFiles[slotIndex] = {
    ...file,
    isRemoved: !file.isRemoved,
  }
  files.value = newFiles

  // จัดการรายการ removedFiles เพื่อส่งกลับ parent
  if (newFiles[slotIndex].isRemoved) {
    removedFiles.value.push(file.id || file.fileName)
  } else {
    removedFiles.value = removedFiles.value.filter((f) => f !== (file.id || file.fileName))
  }

  emitValidFiles()
  emit('removed', removedFiles.value)
}

function open() {
  inputEl.value && inputEl.value.click()
}

function onInputChange(e) {
  const list = Array.from(e.target.files || [])
  addFiles(list)
  console.log('onInputChange')
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
  console.log('onDrop')
}

function addFiles(incoming) {
  if (!incoming.length) return

  if (props.maxSlots) {
    // Slot-based upload
    const availableSlots = files.value.filter((f) => !f || f.isRemoved).length
    if (availableSlots === 0) {
      const msg = `All ${props.maxSlots} slots are occupied.`
      errors.value.push(msg)
      emit('error', msg)
      return
    }

    if (incoming.length > availableSlots) {
      const msg = `Maximum ${props.maxSlots} pictures are allowed.`
      errors.value.push(msg)
      emit('error', msg)
      incoming = incoming.slice(0, availableSlots)
    }

    // Add files to empty slots

    for (
      let slotIndex = 0, fileIndex = 0;
      slotIndex < props.maxSlots && fileIndex < incoming.length;
      slotIndex++
    ) {
      if (!files.value[slotIndex] || files.value[slotIndex].isRemoved) {
        const file = incoming[fileIndex]
        const error = validateFile(file)

        if (error) {
          emit('error', error)
          fileIndex++ // move on to the next incoming file
          slotIndex-- // retry the SAME slot on next iteration
          continue
        }

        files.value[slotIndex] = {
          id: makeId(),
          imageFile: file,
          fileName: file.name,
          slotIndex,
          order: slotIndex + 1,
          previewUrl: isPreviewable(file) ? URL.createObjectURL(file) : null,
          error: null,
          isRemoved: false,
        }
        fileIndex++
      }
    }
  } else {
    // Original behavior for non-slot mode
    if (props.maxFiles && files.value.length + incoming.length > props.maxFiles) {
      const msg = `You can only upload up to ${props.maxFiles} file(s).`
      errors.value.push(msg)
      emit('error', msg)
      incoming = incoming.slice(0, Math.max(0, props.maxFiles - files.value.length))
    }

    const newItems = incoming.map((file) => {
      const error = validateFile(file)

      if (error) {
        emit('error', error)
        return
      }

      return {
        id: makeId(),
        imageFile: file,
        fileName: file.name,
        order: null,
        previewUrl: isPreviewable(file) ? URL.createObjectURL(file) : null,
        error,
        isRemoved: false, // เพิ่ม default value
      }
    })

    files.value = props.multiple ? [...files.value, ...newItems] : [newItems[0]].filter(Boolean)
  }

  emitValidFiles()
}

function removeFromSlot(slotIndex) {
  if (props.maxSlots && files.value[slotIndex]) {
    const fileToRemove = files.value[slotIndex]

    if (fileToRemove.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }

    // Set slot to null instead of removing
    files.value[slotIndex] = null
    emitValidFiles()
  }
}

function remove(id) {
  if (props.maxSlots) {
    // Find and remove from slot
    const slotIndex = files.value.findIndex((f) => f && f.id === id)
    if (slotIndex !== -1) {
      removeFromSlot(slotIndex)
    }
  } else {
    // Original behavior
    const idx = files.value.findIndex((f) => f.id === id)
    if (idx !== -1) {
      const fileToRemove = files.value[idx]
      files.value.splice(idx, 1)

      if (fileToRemove.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl)
      emitValidFiles()
    }
  }
}

function moveUp(index) {
  if (index > 0 && !props.maxSlots) {
    const temp = files.value[index]
    files.value[index] = files.value[index - 1]
    files.value[index - 1] = temp
    emitValidFiles()
  }
}

function moveDown(index) {
  if (index < files.value.length - 1 && !props.maxSlots) {
    const temp = files.value[index]
    files.value[index] = files.value[index + 1]
    files.value[index + 1] = temp
    emitValidFiles()
  }
}

function emitValidFiles() {
  const validFiles = files.value
    .map((f, slotIndex) => {
      if (!f) return null
      return {
        id: f.id,
        fileName: f.fileName,
        imageFile: f.imageFile,
        previewUrl: f.previewUrl,
        imageUrl: f.imageUrl,
        slotIndex,
        isRemoved: f.isRemoved || false,
      }
    })
    .filter(Boolean)
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
  const parts = accept
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const ext = file.name.includes('.') ? '.' + file.name.split('.').pop().toLowerCase() : ''
  const type = (file.type || '').toLowerCase()
  return parts.some((p) => {
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

// Slot movement functions
function canMoveLeft(slotIndex) {
  return slotIndex > 0
}

function canMoveRight(slotIndex) {
  return slotIndex < props.maxSlots - 1
}

function moveSlotLeft(slotIndex) {
  if (canMoveLeft(slotIndex)) {
    const targetIndex = slotIndex - 1
    swapSlots(slotIndex, targetIndex)
  }
}

function moveSlotRight(slotIndex) {
  if (canMoveRight(slotIndex)) {
    const targetIndex = slotIndex + 1
    swapSlots(slotIndex, targetIndex)
  }
}

function swapSlots(fromIndex, toIndex) {
  const temp = files.value[fromIndex]
  files.value[fromIndex] = files.value[toIndex]
  files.value[toIndex] = temp

  // Update slot indices
  if (files.value[fromIndex]) {
    files.value[fromIndex].slotIndex = fromIndex
    files.value[fromIndex].order = toIndex
    console.log('Swapped from', fromIndex, 'to', toIndex)
  }
  if (files.value[toIndex]) {
    files.value[toIndex].slotIndex = toIndex
    files.value[toIndex].order = fromIndex
    console.log('Swapped from', toIndex, 'to', fromIndex)
  }

  emitValidFiles()
}

// Drag and drop for slot rearrangement
function onFileDragStart(e, slotIndex) {
  draggedSlotIndex.value = slotIndex
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', slotIndex.toString())
}

function onFileDragEnd() {
  draggedSlotIndex.value = null
  dropTargetSlotIndex.value = null
}

function onSlotDragOver(e, slotIndex) {
  if (draggedSlotIndex.value !== null && draggedSlotIndex.value !== slotIndex) {
    e.dataTransfer.dropEffect = 'move'
    dropTargetSlotIndex.value = slotIndex
  }
}

function onSlotDragLeave() {
  dropTargetSlotIndex.value = null
}

function onSlotDrop(e, slotIndex) {
  e.preventDefault()

  if (draggedSlotIndex.value !== null && draggedSlotIndex.value !== slotIndex) {
    swapSlots(draggedSlotIndex.value, slotIndex)
  }

  draggedSlotIndex.value = null
  dropTargetSlotIndex.value = null
}
</script>
