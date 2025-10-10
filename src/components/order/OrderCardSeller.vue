<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  order: { type: Object, required: true },
})

const router = useRouter()

const formatDate = d => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const formatCurrency = n => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'
const totalPrice = computed(() =>
  props.order?.orderItems?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0)
)
</script>

<template>
  <div
    class="border border-green-200 p-4 rounded-xl shadow-sm mb-3 hover:bg-green-50 cursor-pointer transition-all"
    @click="router.push(`/sale-orders/${order.id}`)"
  >
    <div class="flex justify-between items-start mb-2">
      <div>
        <div class="font-semibold text-green-800">
          {{ order.buyer?.nickname || 'Unknown Buyer' }}
        </div>
        <div class="text-sm text-gray-600">
          <span class="font-medium">Shipped To:</span> {{ order.shippingAddress }}
        </div>
      </div>

      <div
        class="px-2 py-1 rounded-full text-xs font-semibold uppercase"
        :class="{
          'bg-yellow-100 text-yellow-800': order.orderStatus === 'NEW',
          'bg-red-100 text-red-700': order.orderStatus === 'CANCELED',
          'bg-green-100 text-green-700': order.orderStatus === 'COMPLETED'
        }"
      >
        {{ order.orderStatus }}
      </div>
    </div>

    <div class="text-sm text-gray-700 space-y-1 text-right">
      <div><span class="font-medium">Order No:</span> {{ order.id }}</div>
      <div><span class="font-medium">Order Date:</span> {{ formatDate(order.orderDate) }}</div>
      <div><span class="font-medium">Total:</span> {{ formatCurrency(totalPrice) }}</div>
    </div>
  </div>
</template>
