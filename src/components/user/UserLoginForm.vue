<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <XInput
      v-model="form.email"
      label="Email"
      type="email"
      required
      :error-message="touched.email ? errors.email : ''"
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
      placeholder="Enter your password"
      class="itbms-password"
      @blur="onBlur('password')"
    />

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
import { useAuthStore } from '@/stores/userAuth.store'
import { useToastStore } from '@/stores/toast.store'
import { UserService } from '@/services'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'

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

const onBlur = (field) => {
  touched[field] = true
  validateField(field)
}

const validateField = (field) => {
  errors[field] = ''
  const value = form[field]?.trim()

  if (!value) {
    errors[field] = `${field === 'email' ? 'Email' : 'Password'} is required.`
  }
}

const validateForm = () => {
  validateField('email')
  validateField('password')
  return !errors.email && !errors.password
}

const isValid = computed(() => validateForm())

const handleSubmit = async () => {
  touched.email = true
  touched.password = true

  if (!validateForm()) {
    toast.add({ type: 'error', message: 'Please fill in all required fields.' })
    return
  }

  loading.value = true

  try {
    const res = await UserService.login(form)
    console.log('login response', res)

    if (!res.success) {
      const rawMessage = res.message || res.error || 'There is a problem. Please try again later.'
      const message = rawMessage.toLowerCase()

      if (message.includes('401') || message.includes('incorrect')) {
        toast.add({ type: 'error', message: 'Email or Password is incorrect.' })
      } else if (message.includes('activate')) {
        toast.add({ type: 'error', message: 'You need to activate your account before signing in.' })
      } else {
        toast.add({ type: 'error', message: rawMessage })
      }

      return
    }

    const accessToken = res.data?.access_token
    const refreshToken = res.data?.refresh_token

    if (accessToken && refreshToken) {
      authStore.login(accessToken)
      toast.add({ type: 'success', message: 'Login successful' })
      router.push('/')
    } else {
      toast.add({ type: 'error', message: 'Login failed. Invalid token response.' })
    }

  } catch (err) {
    console.error('Login error:', err)
    toast.add({ type: 'error', message: 'Unexpected error occurred during login.' + err })
  } finally {
    loading.value = false
  }
}

// const handleSubmit = async () => {
//   touched.email = true
//   touched.password = true

//   if (!validateForm()) {
//     toast.add({ type: 'error', message: 'Please fill in all required fields.' })
//     return
//   }

//   try {
//     loading.value = true
//     const res = await UserService.login(form)

//     const accessToken = res.data?.access_token
//     const refreshToken = res.data?.refresh_token

//     if (accessToken && refreshToken) {
//       authStore.login(accessToken)
//       toast.add({ type: 'success', message: 'Login successful' })
//       router.push('/')
//     }
//   } catch (err) {
//     const status = err.response?.status
//     // const errorMessage = err.response?.data?.errorMessage || 'Unknown error'

//     if (status === 400 || status === 401) {
//       toast.add({ type: 'error', message: 'Email or Password is incorrect.' })
//     } else if (status === 403) {
//       toast.add({ type: 'error', message: 'You need to activate your account before signing in.' })
//     } else {
//       toast.add({ type: 'error', message: 'There is a problem. Please try again later.' })
//     }
//   } finally {
//     loading.value = false
//   }
// }

const handleCancel = () => {
  form.email = ''
  form.password = ''
  touched.email = false
  touched.password = false
  errors.email = ''
  errors.password = ''
  router.push('/')
}
</script>
