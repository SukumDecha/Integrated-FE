<script setup>
import CartItemRow from './CartItemRow.vue'
import { defineProps } from 'vue'
import { useCartStore } from '@/stores/cart.store'
import XButton from '@/components/common/XButton.vue'
import { Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'

const cartStore = useCartStore()
const props = defineProps({
  seller: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})

const showConfirm = ref(false)
const openDeleteModal = () => {
  showConfirm.value = true
}
const confirmDelete = () => {
  props.items.forEach((item) => {
    cartStore.removeItem(item.id)
  })
  showConfirm.value = false
}
</script>

<template>
  <div class="border rounded-lg p-4 space-y-2 itbms-row">
    <!-- Seller -->
    <div class="flex items-center space-x-2 border-b pb-2">
      <input
        type="checkbox"
        :checked="cartStore.isSellerAllSelected(props.seller)"
        @change="cartStore.toggleSeller(props.seller, $event.target.checked)"
        class="itbms-select-nickname h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer"
      />
      <span class="font-semibold itbms-nickname">{{ props.seller }}</span>
          <!-- Delete All Button -->
      <XButton
        variant="ghost"
        size="sm"
        :left-icon="Trash2"
        label="Remove All"
        class-name="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 ml-auto"
        @click="openDeleteModal"
      />
    </div>


    <!-- สินค้าในกลุ่มนี้ -->
    <CartItemRow v-for="(item, index) in props.items" :key="index" :item="item" />
  </div>

  <!-- Delete Confirmation Modal -->
  <XConfirmModal
    v-model="showConfirm"
    title="Remove All Items"
    :message="`Do you want to remove all items from ${props.seller}?`"
    type="error"
    confirm-label="Delete"
    cancel-label="Cancel"
    @confirm="confirmDelete"
  />
</template>
