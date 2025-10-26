<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div class="flex flex-col space-y-4">
      <XInput
        v-model="form.email"
        label="Email"
        type="email"
        required
        :error-message="touched.email ? errors.email : ''"
        maxlength="50"
        placeholder="Enter your email"
        class="itbms-email"
        @blur="onBlur('email')"
      />

      <XInput
        v-model="form.password"
        label="Password"
        type="password"
        required
        :error-message="touched.password ? errors.password : ''"
        maxlength="14"
        placeholder="Enter your password"
        class="itbms-password"
        @blur="onBlur('password')"
      />

      <div class="flex justify-start mt-1 ml-1">
        <XButton
          label="Forgot Password?"
          variant="link"
          type="button"
          class="text-gray-500 hover:text-gray-700 px-0 py-0 text-sm"
          @click="goToForgotPassword"
        />
      </div>
    </div>

    <div class="flex justify-end gap-4 pt-4">
      <XButton
        label="Cancel"
        variant="ghost"
        type="button"
        class="itbms-cancel-button"
        @click="handleCancel"
      />
      <XButton
        label="Signin"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        class="itbms-signin-button"
      />
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { AuthService } from '@/services'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'

// ────────────────────────────────
// State
// ────────────────────────────────
const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const touched = reactive({
  email: false,
  password: false,
})

const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

// ────────────────────────────────
// Validation
// ────────────────────────────────
const onBlur = (field) => {
  touched[field] = true
  validateField(field)
}

const validateField = (field) => {
  errors[field] = ''
  const value = form[field]
  if (!value) {
    errors[field] = `${field === 'email' ? 'Email' : 'Password'} is required.`
  }
}

const validateForm = () => {
  validateField('email')
  validateField('password')
  return !errors.email && !errors.password
}

const isValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password
})

// ────────────────────────────────
// Submit
// ────────────────────────────────
const handleSubmit = async () => {
  touched.email = true
  touched.password = true

  if (!validateForm()) {
    toast.add({ type: 'error', message: 'Please fill in all required fields.' })
    return
  }

  loading.value = true

  try {
    const res = await AuthService.login({
      email: form.email.trim(),
      password: form.password.trim(),
    })

    if (res.error) {
      toast.add({
        type: 'error',
        message: res.message?.trim() || res.error?.trim() || 'Login failed. Please try again.',
      })
      return
    }

    const accessToken = res.data?.access_token

    if (!accessToken) {
      toast.add({ type: 'error', message: 'Invalid token response.' })
      return
    }

    // Update store
    authStore.login(accessToken)
    toast.add({ type: 'success', message: 'Login successful' })

    // ดึง role จาก userInfo ที่ authStore decode แล้ว
    const userRole = authStore.userInfo.role

    // redirect ตาม role
    if (userRole?.toLowerCase() === 'seller') {
      router.push('/sale-items/list')
    } else {
      router.push('/sale-items')
    }
  } catch (err) {
    toast.add({
      type: 'error',
      message: err?.message || 'Unexpected error occurred during login.',
    })
  } finally {
    loading.value = false
  }
}

// ────────────────────────────────
// Other actions
// ────────────────────────────────
const handleCancel = () => {
  form.email = ''
  form.password = ''
  touched.email = false
  touched.password = false
  errors.email = ''
  errors.password = ''
  router.push('/')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>
