<script setup>
import { reactive, computed } from 'vue'
import XButton from '@/components/common/XButton.vue'
import XInput from '@/components/common/form/XInput.vue'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { OrderService } from '@/services'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const touched = reactive({
  address: false,
})

const errors = reactive({
  address: '',
})

const validateField = (field) => {
  if (field === 'address') {
    if (!cartStore.shippingAddress || cartStore.shippingAddress.trim() === '') {
      errors.address = 'Shipping address is required.'
    } else {
      errors.address = ''
    }
  }
}

const validateForm = () => {
  touched.address = true
  validateField('address')
  return !errors.address
}

const onBlur = (field) => {
  touched[field] = true
  validateField(field)
}

const canPlaceOrder = computed(() => {
  const hasSelectedItems = cartStore.selectedTotalItems > 0
  const hasAddress = cartStore.shippingAddress?.trim().length > 0
  return hasSelectedItems && hasAddress
})

const handlePlaceOrder = async () => {
  if (!validateForm()) return

  const sellerGroups = cartStore.getSellerGroups().value
  const selectedGroups = sellerGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((i) => i.selected),
    }))
    .filter((group) => group.items.length > 0)

  const ordersPayload = selectedGroups.map((group) => ({
    buyerId: authStore.user?.id,
    sellerId: group.items[0].sellerId,
    orderDate: new Date().toISOString(),
    shippingAddress: cartStore.shippingAddress,
    orderNote: cartStore.orderNote,
    orderItems: group.items.map((item) => ({
      saleItemId: item.id,
      price: item.price,
      quantity: item.quantity,
      description: `${item.brand} ${item.model} (${item.storageGb}GB, ${item.color})`,
    })),
    orderStatus: 'COMPLETED',
  }))


  const response = await OrderService.placeOrder(ordersPayload)

  if (response.error) {
    toastStore.add({ type: 'error', message: response.error || 'Failed to place order' })
    return
  }

  toastStore.add({ type: 'success', message: 'Your order has been successfully processed.' })

  cartStore.placeOrder()

  if (cartStore.items.length === 0) {
    router.push({ name: 'sale-items-gallery' })
  }
}
</script>
<template>
  <div class="border rounded-lg p-4 space-y-4 shadow">
    <h1 class="font-semibold border-b pb-2">
      Cart Summary
    </h1>
    <h3 class="font-semibold">
      Ship To
    </h3>

    <!-- Shipping Address -->
    <XInput
      v-model="cartStore.shippingAddress"
      label="Address"
      type="textarea"
      placeholder="Address (No, Street, Subdistrict, District, Province, Postal Code)"
      class="itbms-shipping-address"
      required
      rows="3"
      :error-message="touched.address ? errors.address : ''"
      @blur="onBlur('address')"
    />

    <!-- Order Note -->
    <XInput
      v-model="cartStore.orderNote"
      label="Note"
      type="textarea"
      placeholder="Additional instructions or requests"
      class="itbms-order-note"
      rows="2"
    />

    <div class="border-t pt-5 mt-5">
      <p class="itbms-total-order-items">
        Total items :
        <span>{{ cartStore.selectedTotalItems }}</span>
      </p>
      <p class="itbms-total-order-price font-bold text-emerald-600 mt-2">
        Total price :
        <span>{{ cartStore.selectedTotalPrice.toLocaleString() }}</span> Baht
      </p>
    </div>

    <XButton
      variant="primary"
      size="md"
      class="w-full itbms-place-order-button"
      :disabled="!canPlaceOrder"
      @click="handlePlaceOrder"
    >
      Place Order
    </XButton>
  </div>
</template>
