<script setup>
import XButton from '@/components/common/XButton.vue'
const fallbackImageUrl = new URL('/assets/sale-item/shopping.webp', import.meta.url).pathname
import { defineProps } from 'vue'
import { useCartStore } from '@/stores/cart.store'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})
const cartStore = useCartStore()
const showConfirm = ref(false)

const handleDecrease = () => {
  const ok = cartStore.decreaseQty(props.item.id)
  if (!ok) {
    // ถ้า false แสดงว่าเหลือ 1 → เปิด modal
    showConfirm.value = true
  }
}

const confirmDelete = () => {
  cartStore.removeItem(props.item.id)
}
</script>

<template>
  <div class="flex items-center space-x-4 py-2 itbms-item-row">
    <!-- Checkbox -->
    <input
      type="checkbox"
      :checked="props.item.selected"
      @change="cartStore.toggleItem(props.item.id, $event.target.checked)"
      :class="itbms - item"
    />

    <!-- รูป -->
    <img
      :src="props.item.imageUrl || fallbackImageUrl"
      :alt="`${props.item.brand} ${props.item.model} product image`"
      class="w-20 h-20 object-cover rounded"
    />

    <!-- รายละเอียด -->
    <div class="flex-1 itbms-item-description">
      <p class="font-medium">{{ props.item.brand }} {{ props.item.model }} ({{ props.item.storageGb }} GB, {{ props.item.color }})</p>
      <p class="font-medium itbms-item-total-price text-emerald-600 font-extrabold">
        Price :
        <span class="itbms-item-total-price text-emerald-600 font-extrabold">{{
          props.item.price.toLocaleString()
        }}</span>
        <span class="text-emerald-600"> Baht</span>
      </p>
    </div>

    <!-- ปุ่มจำนวน -->
    <div class="flex items-center space-x-2">
      <XButton size="sm" variant="outline" class="itbms-dec-qty-button" @click="handleDecrease"
        >-</XButton
      >
      <span class="px-2 itbms-item-quantity">{{ props.item.quantity }}</span>
      <XButton
        size="sm"
        variant="outline"
        class="itbms-inc-qty-button"
        @click="cartStore.increaseQty(props.item.id)"
        >+</XButton
      >
      <!-- ✅ ปุ่มลบ -->
      <XButton
        size="sm"
        variant="destructive"
        class="bg-gray-200 text-gray-700 hover:bg-gray-300 itbms-remove-item ml-2"
        @click="showConfirm = true"
      >
        🗑
      </XButton>
      <XConfirmModal
        v-model="showConfirm"
        title="Remove item"
        :message="`Do you want to remove ${props.item.model} from cart?`"
        confirm-label="Delete"
        cancel-label="Cancel"
        @confirm="confirmDelete"
      />
    </div>
  </div>
</template>
