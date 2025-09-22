<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="max-w-3xl mx-auto space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="rounded-full h-12 w-12 border-4" />
        <div class="space-y-1">
          <h3 class="font-bold">
            Edit Profile
          </h3>
          <p class="font-thin text-slate-700">
            Update your profile information
          </p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccessMessage"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
    >
      Profile data is updated successfully.
    </div>

    <!-- Buyer Profile Fields -->
    <div class="grid grid-cols-2 gap-4 p-4 border rounded-lg">
      <h4 class="col-span-2 font-semibold text-gray-700 mb-2">
        Basic Information
      </h4>

      <XInput
        v-model="formData.nickname"
        label="Nickname *"
        placeholder="Enter nickname"
        :error="errors.nickname"
        @input="onFieldChange"
      />

      <XInput
        v-model="formData.fullname"
        label="Full Name *"
        placeholder="Enter full name"
        :error="errors.fullname"
        @input="onFieldChange"
      />

      <XInput
        v-model="formData.email"
        label="Email"
        placeholder="Enter email"
        disabled
        readonly
        class="bg-gray-50"
      />

      <div class="relative">
        <XInput
          label="Password"
          type="password"
          disabled
          readonly
          class="bg-gray-50"
        />
        <div class="absolute inset-0 bg-gray-100 opacity-50 rounded" />
        <div class="absolute top-8 left-3 text-sm text-gray-500">
          Password content hidden
        </div>
      </div>
    </div>

    <!-- Seller Additional Fields (only shown for sellers) -->
    <div
      v-if="originalProfile.userType === 'SELLER'"
      class="border rounded-lg p-4"
    >
      <h4 class="font-semibold text-gray-700 mb-4">
        Seller Information
      </h4>

      <div class="grid grid-cols-2 gap-4">
        <XInput
          v-model="maskedMobileNo"
          label="Mobile Number"
          placeholder="Mobile number"
          disabled
          readonly
          class="bg-gray-50"
        />

        <XInput
          v-model="maskedBankNo"
          label="Bank Account Number"
          placeholder="Bank account number"
          disabled
          readonly
          class="bg-gray-50"
        />

        <XInput
          v-model="originalProfile.bankName"
          label="Bank Name"
          placeholder="Bank name"
          disabled
          readonly
          class="bg-gray-50"
        />
      </div>

      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p class="text-sm text-blue-700">
          <strong>Note:</strong> Mobile number, bank account number, national ID number, bank name, and national ID photo cannot be edited. Contact support if you need to update this information.
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <XButton
        variant="secondary"
        :disabled="isSaving"
        @click="doCancel"
      >
        Cancel
      </XButton>

      <XButton
        :disabled="!canSave || isSaving"
        :loading="isSaving"
        @click="doSave"
      >
        {{ isSaving ? 'Saving...' : 'Save' }}
      </XButton>
    </div>

    <!-- User Role Display (cannot be changed) -->
    <div class="text-center text-sm text-gray-500 pt-2 border-t">
      Account Type: <strong>{{ originalProfile.userType || 'BUYER' }}</strong>
      <div class="text-xs text-gray-400 mt-1">
        User role cannot be changed
      </div>
    </div>
  </div>
</template>

<script setup>
import XButton from '@/components/common/XButton.vue';
import XInput from '@/components/common/form/XInput.vue';
import { AuthService, UserService } from '@/services';
import { useToastStore } from '@/stores/toast.store';
import { maskNumber } from '@/utils';
import { onMounted, ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const originalProfile = ref({});
const toast = useToastStore()

const formData = reactive({
  nickname: '',
  fullName: '',
  email: '',
});
const errors = reactive({
  nickname: '',
  fullName: ''
});
const isSaving = ref(false);
const showSuccessMessage = ref(false);

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Profile', active: true },
]

const maskedMobileNo = computed(() => {
  if (!originalProfile.value.mobileNumber) return '';
  return maskNumber(originalProfile.value.mobileNumber);
});

const maskedBankNo = computed(() => {
  if (!originalProfile.value.bankAccount) return '';
  return maskNumber(originalProfile.value.bankAccount);
});

// Check if save button should be enabled
const canSave = computed(() => {
  const hasChanges = formData.nickname !== originalProfile.value.nickname ||
                     formData.fullname !== originalProfile.value.fullname;

  // All mandatory fields pass validation
  const hasValidFields = formData.nickname.trim() !== '' &&
                        formData.fullname.trim() !== '' &&
                        !errors.nickname &&
                        !errors.fullname;

  return hasChanges && hasValidFields;
});

// Validation functions
const validateNickname = (value) => {
  if (!value || value.trim() === '') {
    return 'Nickname is required';
  }
  if (value.trim().length < 2) {
    return 'Nickname must be at least 2 characters';
  }
  return '';
};

const validateFullName = (value) => {
  if (!value || value.trim() === '') {
    return 'Full name is required';
  }
  if (value.trim().length < 2) {
    return 'Full name must be at least 2 characters';
  }
  return '';
};

// Handle field changes and validation
const onFieldChange = () => {
  // Clear previous errors and validate
  errors.nickname = validateNickname(formData.nickname);
  errors.fullname = validateFullName(formData.fullname);
};

// Load profile data
const loadProfile = async () => {
  const response = await AuthService.getCurrentUser();

  if (response.error) {
    toast.add({ type: 'error', message: response.error })
    return;
  }
  originalProfile.value = response.data;

  formData.nickname = originalProfile.value.nickname || '';
  formData.fullname = originalProfile.value.fullname || '';
  formData.email = originalProfile.value.email || '';
};

// Save profile changes
const doSave = async () => {
  if (!canSave.value || isSaving.value) return;

  // Disable save button to prevent duplicate submissions (requirement 6)
  isSaving.value = true;

  try {
    // Prepare data to send (only editable fields)
    const updateData = {
      nickname: formData.nickname.trim(),
      fullname: formData.fullname.trim()
    };

    // Send PUT request to backend
    const response = await UserService.updateUser(originalProfile.value.id, updateData);

    if (response.error) {
      toast.add({ type: 'error', message: response.error })
      return;
    }

    // Update original profile with new values
    originalProfile.value.nickname = formData.nickname;
    originalProfile.value.fullname = formData.fullname;

    // Show success message briefly then redirect (requirement 7)
    showSuccessMessage.value = true;

    setTimeout(() => {
      router.push('/profile');
    }, 2000);

  } catch (error) {
    console.error('Error saving profile:', error);
    // Handle error appropriately
  } finally {
    isSaving.value = false;
  }
};

// Cancel editing and go back
const doCancel = () => {
  router.push('/profile');
};

onMounted(loadProfile);
</script>

<style scoped>
.bg-gray-50 {
  background-color: #f9fafb;
}

.opacity-50 {
  opacity: 0.5;
}
</style>
