<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <!-- Email -->
    <XInput
      v-model="form.email"
      label="Email Address"
      type="email"
      required
      :error-message="touchedFields.email ? errors.email : ''"
      placeholder="e.g. example@gmail.com"
      class="itbms-email"
      @blur="onBlur('email')"
    />

    <!-- Password -->
    <XInput
      v-model="form.password"
      label="Password"
      type="password"
      required
      :error-message="touchedFields.password ? errors.password : ''"
      placeholder="Enter your password"
      class="itbms-password"
      @blur="onBlur('password')"
    />

    <!-- Buttons -->
    <div class="flex justify-end gap-4 pt-4">
      <XButton
        label="Cancel"
        variant="ghost"
        type="button"
        class="itbms-cancel-button"
        @click="handleCancel"
      />
      <XButton
        label="Sign In"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        class="itbms-signin-button"
      />
    </div>

    <!-- Sign Up Link -->
    <div class="text-center pt-4 border-t">
      <p class="text-sm text-gray-600">
        Don't have an account?
        <router-link
          to="/signup"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign up here
        </router-link>
      </p>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import { useToastStore } from '@/stores/toast.store'
import { AuthService } from '@/services'
import { useRouter } from 'vue-router'
import { saveToLocalStorage } from '@/utils'
import { AUTH_STORAGE_KEYS } from '@/constants'

const toast = useToastStore()
const emit = defineEmits(['signedIn'])
const router = useRouter()

const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const touchedFields = reactive({
  email: false,
  password: false,
})

function onBlur(field) {
  touchedFields[field] = true
  validateForm()
}

function validateForm() {
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!form.email) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  }

  return Object.values(errors).every((msg) => !msg)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValid = computed(() => validateForm())

const handleSubmit = async () => {
  Object.keys(touchedFields).forEach((f) => (touchedFields[f] = true))
  if (!validateForm()) {
    toast.add({ type: 'error', message: 'Please fill in all required fields correctly.' })
    return
  }

  loading.value = true

  try {
    const data = {
      email: form.email.trim(),
      password: form.password.trim(),
    }

    const response = await AuthService.login(data)

    if (response.error) {
      toast.add({ type: 'error', message: response.error })
      loading.value = false
      return
    }

    toast.add({
      type: 'success',
      message: 'Sign in successful! Welcome back.',
    })

    emit('signedIn', response.data)

    router.push('/')
    saveToLocalStorage(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token)
  } catch (error) {
    toast.add({
      type: 'error',
      message: error.message || 'Sign in failed. Please try again.'
    })
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/')
}
</script>
