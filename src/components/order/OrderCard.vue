<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { OrderStatus } from '@/constants/order.constant.js'

const props = defineProps({
  order: { type: Object, required: true },
  isBuyerCard: { type: Boolean, default: false },
})
const router = useRouter()

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '-'
const formatCurrency = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'
const calculateTotalPrice = computed(() => {
  if (!props.order?.orderItems || props.order.orderItems.length === 0) return 0
  return props.order.orderItems.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 0
    return sum + price * qty
  }, 0)
})



// ชื่อที่จะโชว์
const displayName = computed(() => {
  if (props.isBuyerCard) {
    // buyer card → แสดงชื่อผู้ขาย
    return props.order.seller?.nickname || 'Unknown Seller'
  } else {
    // seller card → แสดงชื่อผู้ซื้อ
    return props.order.buyer?.nickname || 'Unknown Buyer'
  }
})

// route path
const orderDetailPath = computed(() =>
  props.isBuyerCard ? `/your-orders/${props.order.id}` : `/sale-orders/${props.order.id}`,
)
</script>

<template>
  <div class="border border-green-200 p-4 rounded-xl shadow-sm mb-3">
    <div
      class="flex flex-col sm:flex-row justify-between gap-4"
      @click="router.push(orderDetailPath)"
    >
      <div class="flex justify-between items-start mb-2">
        <div>
          <!-- ชื่อ (buyer/seller) -->
          <div class="font-semibold text-green-800">
            {{ displayName }}
          </div>
          <div class="text-sm text-gray-600">
            <span class="font-medium">Shipped To:</span>
            {{ order.shippingAddress }}
          </div>
        </div>
      </div>

      <div class="text-sm text-right text-gray-700 space-y-1">
        <div
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase self-start"
          :class="{
            'bg-yellow-100 text-yellow-800': order.orderStatus === OrderStatus.NEW,
            'bg-red-100 text-red-700': order.orderStatus === OrderStatus.CANCELED,
            'bg-green-100 text-green-700': order.orderStatus === OrderStatus.COMPLETED,
          }"
        >
          {{ order.orderStatus }}
        </div>

        <div><span class="font-medium">Order No:</span> {{ order.id }}</div>
        <div><span class="font-medium">Order Date:</span> {{ formatDate(order.orderDate) }}</div>
        <div><span class="font-medium">Payment Date:</span> {{ formatDate(order.orderDate) }}</div>
        <div>
          <span class="font-medium">Total:</span> {{ formatCurrency(calculateTotalPrice) }}
        </div>
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
          <div class="text-gray-600">Qty {{ item.quantity }}</div>
          <div class="font-medium text-green-700">
            Price: {{ formatCurrency(item.price * item.quantity) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
