<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const formatDate = d => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const formatCurrency = n => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'
const calculateTotalPrice = computed(() => props.order?.orderItems?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0))
</script>

<template>
  <div class="border border-gray-300 p-4 rounded-lg">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
      <div>
        <p><span class="font-semibold">Order No:</span> {{ order.id }}</p>
        <p><span class="font-semibold">Order Date:</span> {{ formatDate(order.orderDate) }}</p>
        <p><span class="font-semibold">Total:</span> {{ formatCurrency(calculateTotalPrice) }}</p>
        <p><span class="font-semibold">Shipped To:</span> {{ order.shippingAddress }}</p>
      </div>
      <div>
        <p><span class="font-semibold">Seller:</span> {{ order.seller?.nickname || 'Unknown' }}</p>
        <p><span class="font-semibold">Payment Date:</span> {{ formatDate(order.orderDate) }}</p>
        <p><span class="font-semibold">Status:</span> {{ order.orderStatus }}</p>
        <p v-if="order.orderNote"><span class="font-semibold">Note:</span> {{ order.orderNote }}</p>
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="item in order.orderItems"
        :key="item.no"
        class="flex justify-between items-center border border-gray-200 rounded-md p-3 bg-gray-50"
      >
        <div class="text-gray-800">
          {{ item.description }}
        </div>
        <div class="text-right text-sm">
          <div class="text-gray-600">Qty {{ item.quantity }}</div>
          <div class="itbms-item-price text-gray-600">Unit Price: {{ formatCurrency(item.price) }}</div>
          <div class="itbms-item-total-price font-medium text-black">
            Price: {{ formatCurrency(item.price * item.quantity) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
