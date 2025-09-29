<script setup>
import XButton from '@/components/common/XButton.vue'
import { getImageUrl } from '@/utils';
import { defineProps } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="flex items-center space-x-4 py-2 itbms-item-row">
    <!-- Checkbox -->
    <input type="checkbox" class="itbms-item" />

    <!-- รูป -->
    <img
      :src="getImageUrl(props.item.imageUrl)"
      :alt="props.item.model"
      class="w-20 h-20 object-cover rounded"
    />

    <!-- รายละเอียด -->
    <div class="flex-1 itbms-item-description">
      <p class="font-medium">{{ props.item.brand }} {{ props.item.model }}</p>
      <p class="font-medium itbms-item-total-price text-emerald-600 font-extrabold">
        Price :
        <span class="itbms-item-total-price text-emerald-600 font-extrabold">{{ props.item.price }}</span>
        <span class=" text-emerald-600  "> Baht</span>
      </p>
    </div>

    <!-- ปุ่มจำนวน -->
    <div class="flex items-center space-x-2">
      <XButton size="sm" variant="outline" class="itbms-dec-qty-button">-</XButton>
      <span class="px-2 itbms-item-quantity">{{ props.item.quantity }}</span>
      <XButton size="sm" variant="outline" class="itbms-inc-qty-button">+</XButton>
    </div>
  </div>
</template>
