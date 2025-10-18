<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { OrderStatus } from '@/constants/order.constant.js'
import XButton from '@/components/common/XButton.vue'
import { formatDate } from '@/utils/DateUtils.js'
import { displayOrDash } from '@/utils/TextUtils.js'

const props = defineProps({
  order: { type: Object, required: true },
  isBuyerCard: { type: Boolean, default: false },
})

const router = useRouter()
const formatCurrency = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'

const calculateTotalPrice = computed(() => {
  if (!props.order?.orderItems || props.order.orderItems.length === 0) return 0
  return props.order.orderItems.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 0
    return sum + price * qty
  }, 0)
})

const displayName = computed(() => {
  if (props.isBuyerCard) {
    return props.order.seller?.nickname || 'Unknown Seller'
  } else {
    return props.order.buyer?.nickname || 'Unknown Buyer'
  }
})

const orderDetailPath = computed(() =>
  props.isBuyerCard ? `/your-orders/${props.order.id}` : `/sale-orders/${props.order.id}`,
)

const statusConfig = computed(() => {
  const status = props.order.orderStatus
  if (status === OrderStatus.NEW) {
    return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' }
  } else if (status === OrderStatus.CANCELED) {
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' }
  } else if (status === OrderStatus.COMPLETED) {
    return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' }
  }
  return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' }
})
</script>

<template>
  <div
    :class="[
      'border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-4 cursor-pointer group',
      statusConfig.border
    ]"
    @click="router.push(orderDetailPath)"
  >
    <!-- Header Section -->
    <div :class="['px-6 py-4 border-b-2', statusConfig.bg, statusConfig.border]">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <!-- Left: User Info -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {{ displayName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="font-bold text-lg text-gray-800 itbms-nickname group-hover:text-emerald-600 transition-colors">
              {{ displayName }}
            </div>
            <div class="text-xs text-gray-500 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="itbms-order-date">{{ formatDate(order.orderDate) }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Status Badge -->
        <div>
          <div
            :class="[
              'itbms-order-status inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm',
              statusConfig.badge
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
            {{ order.orderStatus }}
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Section -->
    <div class="px-6 py-4 bg-white">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <!-- Shipping Address -->
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide itbms-shipping-address">Shipped To</div>
            <div class="text-sm text-gray-800 font-medium mt-0.5">{{ order.shippingAddress }}</div>
          </div>
        </div>

        <!-- Order Note -->
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide itbms-order-note">Note</div>
            <div class="text-sm text-gray-800 font-medium mt-0.5">{{ displayOrDash(order.orderNote) }}</div>
          </div>
        </div>
      </div>

      <!-- Order Info Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-b border-gray-100">
        <div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide itbms-order-id">Order No</div>
          <div class="text-sm font-bold text-gray-800 mt-1">#{{ order.id }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide itbms-payment-date">Payment</div>
          <div class="text-sm font-bold text-gray-800 mt-1">{{ formatDate(order.orderDate) }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide itbms-order-status">Status</div>
          <div class="text-sm font-bold text-gray-800 mt-1">{{ order.orderStatus }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide itbms-total-order-price">Total</div>
          <div class="text-base font-bold text-emerald-600 mt-1">฿{{ formatCurrency(calculateTotalPrice) }}</div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="mt-4 space-y-2">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Items</div>
        <div
          v-for="item in order.orderItems"
          :key="item.no"
          class="flex justify-between items-center border-2 border-gray-100 rounded-xl p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
        >
          <div class="flex items-center gap-3 flex-1">
            <div class="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="itbms-item-description text-sm font-semibold text-gray-800">
                {{ item.description }}
              </div>
              <div class="flex items-center gap-3 mt-1">
                <span class="itbms-item-quantity text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  Qty: <span class="font-bold">{{ item.quantity }}</span>
                </span>
                <span class="itbms-item-total-price text-sm font-bold text-emerald-700">
                  ฿{{ formatCurrency(item.price * item.quantity) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
      <XButton
        class="itbms-view-button"
        label="View Details"
        variant="primary"
        size="sm"
        @click="router.push(orderDetailPath)"
      />
    </div>
  </div>
</template>
