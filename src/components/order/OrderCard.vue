<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  order: { type: Object, required: true },
  sellerName: { type: String, required: true }
})

const router = useRouter()

const formatDate = d => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const formatCurrency = n => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'
const calculateTotalPrice = computed(() => props.order?.orderItems?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0))
</script>

<template>
  <div class="border border-green-200 p-4 rounded-xl shadow-sm mb-3">
    <div
      class="flex flex-col sm:flex-row justify-between gap-4"
      @click="router.push(`/your-orders/${props.order.id}`)"
    >
      <div>
        <div class="font-semibold text-green-800">
          {{ sellerName }}
        </div>
        <div class="text-sm text-gray-600">
          <span class="font-medium">Shipped To:</span> {{ order.shippingAddress }}
        </div>
        <div
          v-if="order.orderNote"
          class="text-sm text-gray-600"
        >
          <span class="font-medium">Note:</span> {{ order.orderNote }}
        </div>
      </div>

      <div class="text-sm text-right text-gray-700 space-y-1">
        <div><span class="font-medium">Order No:</span> {{ order.id }}</div>
        <div><span class="font-medium">Order Date:</span> {{ formatDate(order.orderDate) }}</div>
        <div><span class="font-medium">Payment Date:</span> {{ formatDate(order.orderDate) }}</div>
        <div><span class="font-medium">Total:</span> {{ formatCurrency(calculateTotalPrice.value) }}</div>
        <div><span class="font-medium">Status:</span> {{ order.orderStatus }}</div>
      </div>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-for="item in order.orderItems"
        :key="item.no"
        class="flex justify-between items-center border border-green-100 rounded-lg p-3 bg-green-50"
      >
        <div class="text-gray-800">
          {{ item.description }}
        </div>
        <div class="text-right text-sm">
          <div class="text-gray-600">
            Qty {{ item.quantity }}
          </div>
          <div class="font-medium text-green-700">
            Price: {{ formatCurrency(item.price * item.quantity) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
