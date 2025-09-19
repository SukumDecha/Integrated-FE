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
  return form.email.length > 0 && form.password.length > 0 && !errors.email && !errors.password
})

const handleSubmit = async () => {
  touched.email = true
  touched.password = true

  if (!validateForm()) {
    toast.add({ type: 'error', message: 'Please fill in all required fields.' })
    return
  }

  loading.value = true

  try {
    const res = await UserService.login({
      email: form.email.trim(),
      password: form.password.trim(),
    })

    if (res.error !== null) {
      const message =
        res.message?.trim() || res.error?.trim() || 'There is a problem. Please try again later.'
      toast.add({ type: 'error', message })
      return
    }

    const accessToken = res.data?.access_token

    if (accessToken) {
      authStore.login(accessToken)
      toast.add({ type: 'success', message: res.message || 'Login successful' })
      console.log("log in success");

      router.push('/')
    } else {
      toast.add({ type: 'error', message: 'Login failed. Invalid token response.' })
    }

  } catch (err) {
    console.error('Login error:', err)

    // จริง ๆ แล้ว block นี้จะไม่ถูกเรียกเพราะ UserService.login ไม่ throw
    const message = err?.message || 'Unexpected error occurred during login.'
    toast.add({ type: 'error', message })
  } finally {
    loading.value = false
  }
}

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
