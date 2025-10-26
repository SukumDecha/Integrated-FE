<template>
  <form
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <!-- Nickname -->
    <XInput
      v-model="form.nickname"
      label="Nickname"
      required
      :error-message="touchedFields.nickname ? errors.nickname : ''"
      placeholder="e.g. Somsuk"
      class="itbms-nickname"
      @blur="onBlur('nickname')"
    />

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
    <XPasswordInput
      v-model="form.password"
      label="Password"
      type="password"
      required
      :error-message="touchedFields.password ? errors.password : ''"
      placeholder="Enter a strong password"
      class="itbms-password"
      @blur="onBlur('password')"
    />

    <!-- Fullname -->
    <XInput
      v-model="form.fullname"
      label="Full Name"
      required
      :error-message="touchedFields.fullname ? errors.fullname : ''"
      placeholder="e.g. Somsuk Decha"
      class="itbms-fullName"
      @blur="onBlur('fullName')"
    />

    <!-- Seller fields -->
    <template v-if="mode === UserRole.SELLER">
      <XInput
        v-model="form.mobileNumber"
        label="Mobile Number"
        required
        :error-message="touchedFields.mobileNumber ? errors.mobileNumber : ''"
        placeholder="0xx-xxx-xxx"
        class="itbms-mobile"
        @blur="onBlur('mobileNumber')"
      />

      <XInput
        v-model="form.bankAccountNumber"
        label="Bank Account Number"
        required
        :error-message="touchedFields.bankAccountNumber ? errors.bankAccountNumber : ''"
        placeholder="e.g. xxx-x-xxxxx-x"
        class="itbms-bank-account"
        @blur="onBlur('bankAccountNumber')"
      />

      <XInput
        v-model="form.bankName"
        label="Bank Name"
        required
        :error-message="touchedFields.bankName ? errors.bankName : ''"
        placeholder="e.g. Bangkok Bank"
        class="itbms-bank-name"
        @blur="onBlur('bankName')"
      />

      <XInput
        v-model="form.nationalId"
        label="National ID Number"
        required
        :error-message="touchedFields.nationalId ? errors.nationalId : ''"
        placeholder="e.g. xxxxxxxxxx"
        class="itbms-nid"
        @blur="onBlur('nationalId')"
      />

      <!-- National ID Front Image -->
      <XUpload
        v-model="form.nationalIdFrontImage"
        label="National ID Front Image"
        accept="image/*"
        required="true"
        :multiple="false"
        :max-slots="1"
        :max-size="2 * 1024 * 1024"
        class-name="bg-white"
        :error-message="touchedFields.nationalIdFrontImage ? errors.nationalIdFrontImage : ''"
        @blur="onBlur('nationalIdFrontImage')"
        @error="onUploadImageError"
      />

      <!-- National ID Back Image -->
      <XUpload
        v-model="form.nationalIdBackImage"
        label="National ID Back Image"
        accept="image/*"
        required="true"
        :multiple="false"
        :max-slots="1"
        :max-size="2 * 1024 * 1024"
        class-name="bg-white"
        :error-message="touchedFields.nationalIdBackImage ? errors.nationalIdBackImage : ''"
        @blur="onBlur('nationalIdBackImage')"
        @error="onUploadImageError"
      />
    </template>

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
        label="Submit"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        class="itbms-submit-button"
      />
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XUpload from '@/components/common/XUpload.vue'
import XPasswordInput from '../common/form/XPasswordInput.vue'
import { useToastStore } from '@/stores/toast.store'
import { AuthService } from '@/services'
import { useRouter } from 'vue-router'
import { UserRole } from '@/constants'

const toast = useToastStore()
const emit = defineEmits(['submitted'])
const router = useRouter()
const props = defineProps({
  mode: {
    type: String,
    default: UserRole.BUYER,
    validator: (val) => [ UserRole.BUYER, UserRole.SELLER].includes(val),
  },
})

const loading = ref(false)

const form = reactive({
  nickname: '',
  email: '',
  password: '',
  fullName: '',
  mobileNumber: '',
  bankAccountNumber: '',
  bankName: '',
  nationalId: '',
  nationalIdFrontImage: [],
  nationalIdBackImage: [],
})

const errors = reactive({
  nickname: '',
  email: '',
  password: '',
  fullName: '',
  mobileNumber: '',
  bankAccountNumber: '',
  bankName: '',
  nationalId: '',
  nationalIdFrontImage: '',
  nationalIdBackImage: '',
})

const touchedFields = reactive(
  Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
)

function onBlur(field) {
  touchedFields[field] = true
  validateForm()
}

function validateForm() {
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!form.nickname) errors.nickname = 'Nickname is required.'
  if (!form.email) errors.email = 'Email is required.'
  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (!isValidPassword(form.password)) {
    errors.password = 'Password must contain upper, lower, digit, symbol and be 8+ chars.'
  }
  if (!form.fullname) {
    errors.fullname = 'Fullname is required.'
  } else if (form.fullname.length < 4 || form.fullname.length > 40) {
    errors.fullname = 'Fullname must be between 4 and 40 characters.'
  }

  if (props.mode === UserRole.SELLER) {
    if (!form.mobileNumber) errors.mobileNumber = 'Mobile number is required.'
    if (!form.bankAccountNumber) errors.bankAccountNumber = 'Bank account number is required.'
    if (!form.bankName) errors.bankName = 'Bank name is required.'
    if (!form.nationalId) errors.nationalId = 'National ID is required.'
    if (!form.nationalIdFrontImage.length) errors.nationalIdFrontImage = 'Front image is required.'
    if (!form.nationalIdBackImage.length) errors.nationalIdBackImage = 'Back image is required.'
  }

  return Object.values(errors).every((msg) => !msg)
}

function isValidPassword(password) {
  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&./]/.test(password) &&
    password.length >= 8
  )
}

const isValid = computed(() => validateForm())

const handleSubmit = async () => {
  Object.keys(touchedFields).forEach((f) => (touchedFields[f] = true))
  if (!validateForm()) {
    toast.add({ type: 'error', message: 'Please fill in all required fields correctly.' })
    return
  }

  loading.value = true
  const formData = new FormData()

  const data = {
    type: props.mode,
    nickname: form.nickname.trim(),
    email: form.email.trim(),
    password: form.password.trim(),
    fullname: form.fullname.trim(),
    userType: props.mode === UserRole.SELLER ? UserRole.SELLER : UserRole.BUYER,
  }

  if (props.mode === UserRole.SELLER) {
    Object.assign(data, {
      mobileNumber: form.mobileNumber.trim(),
      bankAccountNumber: form.bankAccountNumber.trim(),
      bankName: form.bankName.trim(),
      idCardNumber: form.nationalId.trim(),
    })
  }

  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))

  if (props.mode === UserRole.SELLER) {
    formData.append('idCardImageFront', form.nationalIdFrontImage[0].imageFile)
    formData.append('idCardImageBack', form.nationalIdBackImage[0].imageFile)
  }

  const response = await AuthService.registerUser(formData)

  if (response.error) {
    toast.add({ type: 'error', message: response.error })
    loading.value = false
    return
  }

  toast.add({
    type: 'success',
    message: 'Registration successful! Please check your email to verify your account.',
  })
  emit('submitted')
  loading.value = false
}

function onUploadImageError(err) {
  toast.add({ type: 'error', message: err.message || 'Upload failed. Please try again.' })
}

function handleCancel() {
  router.push('/')
}
</script>
