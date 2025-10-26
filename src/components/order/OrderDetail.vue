<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true },
})

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '-'
const formatCurrency = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'
const calculateTotalPrice = computed(() =>
  props.order?.orderItems?.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0),
)

const statusConfig = computed(() => {
  const status = props.order?.orderStatus?.toUpperCase()
  if (status === 'NEW') {
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' }
  } else if (status === 'CANCELED' || status === 'CANCELLED') {
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' }
  } else if (status === 'COMPLETED') {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' }
  }
  return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300' }
})
</script>

<template>
  <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            Order Details
          </h2>
          <p class="text-sm text-gray-500 mt-0.5">
            Order #{{ order.id }}
          </p>
        </div>
        <div
          :class="[
            'itbms-order-status px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wide',
            statusConfig.bg,
            statusConfig.text,
            statusConfig.border,
            'border',
          ]"
        >
          {{ order.orderStatus }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Order Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
        <!-- Left Column -->
        <div class="space-y-4">
          <div>
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-order-id"
            >
              Order Number
            </p>
            <p class="text-base font-semibold text-gray-900">
              #{{ order.id }}
            </p>
          </div>

          <div>
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-order-date"
            >
              Order Date
            </p>
            <p class="text-base font-semibold text-gray-900">
              {{ formatDate(order.orderDate) }}
            </p>
          </div>

          <div>
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-payment-date"
            >
              Payment Date
            </p>
            <p class="text-base font-semibold text-gray-900">
              {{ formatDate(order.orderDate) }}
            </p>
          </div>

          <div>
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-shipping-address"
            >
              Shipping Address
            </p>
            <p class="text-sm font-medium text-gray-700 leading-relaxed">
              {{ order.shippingAddress }}
            </p>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">
          <div>
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-nickname"
            >
              Seller
            </p>
            <p class="text-base font-semibold text-gray-900">
              {{ order.seller?.nickname || 'Unknown' }}
            </p>
          </div>

          <div>
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-order-status"
            >
              Status
            </p>
            <p :class="['text-base font-semibold', statusConfig.text]">
              {{ order.orderStatus }}
            </p>
          </div>

          <div v-if="order.orderNote">
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-order-note"
            >
              Note
            </p>
            <p class="text-sm font-medium text-gray-700 leading-relaxed">
              {{ order.orderNote }}
            </p>
          </div>

          <div class="pt-2">
            <p
              class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 itbms-item-total-price"
            >
              Total Amount
            </p>
            <p class="text-2xl font-bold text-gray-900">
              ฿{{ formatCurrency(calculateTotalPrice) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="pt-6">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Order Items <span class="text-gray-400">({{ order.orderItems?.length || 0 }})</span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="item in order.orderItems"
            :key="item.no"
            class="flex justify-between items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="flex-1">
              <p class="itbms-item-description text-sm font-semibold text-gray-900 mb-2">
                {{ item.description }}
              </p>
              <div class="flex items-center gap-4 text-xs text-gray-600">
                <span class="itbms-item-quantity">Qty: <span class="font-semibold text-gray-900">{{ item.quantity }}</span></span>
                <span class="itbms-item-price">Unit Price: ฿{{ formatCurrency(item.price) }}</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 mb-1">
                Subtotal
              </p>
              <p class="itbms-item-total-price text-base font-bold text-gray-900">
                ฿{{ formatCurrency(item.price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grand Total -->
      <div class="mt-6 pt-6 border-t border-gray-200 flex justify-end">
        <div class="text-right">
          <p class="text-sm text-gray-500 mb-1">
            Grand Total
          </p>
          <p class="text-3xl font-bold text-gray-900">
            ฿{{ formatCurrency(calculateTotalPrice) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
