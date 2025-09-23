<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="rounded-full h-12 w-12 border-4">
          <div
            class="h-full w-full bg-gray-300 flex items-center justify-center rounded-full text-gray-600 text-xl font-semibold"
          >
            {{ profile.fullname ? profile.fullname.charAt(0).toUpperCase() : 'U' }}
          </div>
        </div>
        <div class="space-y-1">
          <h3 class="font-bold">
            {{ isEditMode ? 'Edit Profile' : profile.fullname }}
          </h3>
          <p class="font-thin text-slate-700">
            {{ isEditMode ? 'Update your profile information' : profile.email }}
          </p>
        </div>
      </div>

      <XButton
        v-if="!isEditMode"
        @click="toggleEditMode"
      >
        Edit Profile
      </XButton>
    </div>

    <!-- Success Message (only in edit mode) -->
    <div
      v-if="showSuccessMessage && isEditMode"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
    >
      Profile data is updated successfully.
    </div>

    <!-- Basic Information -->
    <div
      class="grid grid-cols-2 gap-4"
      :class="isEditMode ? 'p-4 border rounded-lg' : 'p-2'"
    >
      <h4
        v-if="isEditMode"
        class="col-span-2 font-semibold text-gray-700 mb-2"
      >
        Basic Information
      </h4>

      <XInput
        v-model="formData.nickname"
        label="Nickname"
        :label-required="isEditMode"
        placeholder="Enter nickname"
        :disabled="!isEditMode || showSuccessMessage"
        :error="isEditMode ? errors.nickname : ''"
        @input="onFieldChange"
      />

      <XInput
        v-model="formData.fullname"
        label="Full Name"
        :label-required="isEditMode"
        placeholder="Enter full name"
        :disabled="!isEditMode || showSuccessMessage"
        :error="isEditMode ? errors.fullname : ''"
        @input="onFieldChange"
      />

      <XInput
        v-model="formData.email"
        label="Email"
        placeholder="Enter email"
        disabled
        readonly
        :class="isEditMode ? 'bg-gray-50' : ''"
      />

      <div class="relative">
        <XInput
          :model-value="isEditMode ? '' : maskedPassword"
          label="Password"
          type="password"
          :placeholder="isEditMode ? '' : '••••••••'"
          disabled
          readonly
          :class="isEditMode ? 'bg-gray-50' : ''"
        />
        <div
          v-if="isEditMode"
          class="absolute inset-0 bg-gray-100 opacity-50 rounded"
        />
        <div
          v-if="isEditMode"
          class="absolute top-8 left-3 text-sm text-gray-500"
        >
          Password content hidden
        </div>
      </div>
    </div>

    <!-- Seller Information (only for sellers) -->
    <div v-if="profile.userType === 'SELLER'">
      <div
        v-if="!isEditMode"
        class="border-b border-slate-400 my-4"
      />

      <div :class="isEditMode ? 'border rounded-lg p-4' : ''">
        <h4 class="font-semibold text-gray-700 mb-3">
          Seller Information
        </h4>

        <div
          class="grid grid-cols-2 gap-4"
          :class="!isEditMode ? 'p-2' : ''"
        >
          <XInput
            v-model="maskedMobileNo"
            label="Mobile Number"
            placeholder="Mobile number"
            disabled
            readonly
            :class="isEditMode ? 'bg-gray-50' : ''"
          />

          <XInput
            v-model="maskedBankNo"
            label="Bank Account Number"
            placeholder="Bank account number"
            disabled
            readonly
            :class="isEditMode ? 'bg-gray-50' : ''"
          />

          <XInput
            v-model="profile.bankName"
            label="Bank Name"
            placeholder="Bank name"
            disabled
            readonly
            :class="isEditMode ? 'bg-gray-50' : ''"
          />
        </div>

        <div
          v-if="isEditMode"
          class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded"
        >
          <p class="text-sm text-blue-700">
            <strong>Note:</strong> Mobile number, bank account number, national ID number, bank name, and national ID photo cannot be edited. Contact support if you need to update this information.
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons (only in edit mode) -->
    <div
      v-if="isEditMode"
      class="flex justify-end gap-3 pt-4 border-t"
    >
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

    <!-- User Role Display -->
    <div class="text-center text-sm text-gray-500 pt-2 border-t">
      Account Type: <strong>{{ profile.userType || 'BUYER' }}</strong>
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
import { onMounted, ref, computed, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const route = useRoute();
const toast = useToastStore();

const userStore = useAuthStore()

// Props for controlling edit mode externally
const props = defineProps({
  editMode: {
    type: Boolean,
    default: false
  }
});

// Reactive state
const profile = ref({});
const isEditMode = ref(props.editMode);
const formData = reactive({
  nickname: '',
  fullname: '',
  email: '',
});
const errors = reactive({
  nickname: '',
  fullname: ''
});

const isSaving = ref(false);
const showSuccessMessage = ref(false);

const maskedPassword = computed(() => '••••••••');

const maskedMobileNo = computed(() => {
  if (!profile.value.mobileNumber) return '';
  return maskNumber(profile.value.mobileNumber);
});

const maskedBankNo = computed(() => {
  if (!profile.value.bankAccount) return '';
  return maskNumber(profile.value.bankAccount);
});

const canSave = computed(() => {
  if (!isEditMode.value) return false;

  const hasChanges = formData.nickname !== profile.value.nickname ||
                     formData.fullname !== profile.value.fullname;

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

// Methods
const onFieldChange = () => {
  if (!isEditMode.value) return;

  errors.nickname = validateNickname(formData.nickname);
  errors.fullname = validateFullName(formData.fullname);
};

const loadProfile = async () => {
  const response = await AuthService.getCurrentUser();

  if (response.error) {
    toast.add({ type: 'error', message: response.error });
    return;
  }

  profile.value = response.data;
  syncFormData();
};

const syncFormData = () => {
  formData.nickname = profile.value.nickname || '';
  formData.fullname = profile.value.fullname || '';
  formData.email = profile.value.email || '';
};

const toggleEditMode = () => {
  isEditMode.value = true;
  syncFormData(); // Reset form data when entering edit mode

  // Update URL to reflect edit mode
  router.push('/profile/edit');
};

const doSave = async () => {
  if (!canSave.value || isSaving.value) return;

  isSaving.value = true;

  try {
    const updateData = {
      nickname: formData.nickname.trim(),
      fullname: formData.fullname.trim()
    };

    const response = await UserService.updateUser(profile.value.id, updateData);

    if (response.error) {
      toast.add({ type: 'error', message: response.error });
      return;
    }

    // Trim form data
    formData.nickname = formData.nickname.trim();
    formData.fullname = formData.fullname.trim();

    // Update profile with new values
    profile.value.nickname = formData.nickname.trim();
    profile.value.fullname = formData.fullname.trim();

    // Update user store
    const userProfile = { ...userStore.user }
    userStore.setUser({
      ...userProfile,
      nickname: formData.nickname.trim(),
      fullname: formData.fullname.trim()
    });

    // Show success message and redirect
    showSuccessMessage.value = true;

    setTimeout(() => {
      isEditMode.value = false;
      router.push('/profile');
    }, 2000);

  } catch (error) {
    console.error('Error saving profile:', error);
    toast.add({ type: 'error', message: 'An error occurred while saving' });
  } finally {
    isSaving.value = false;
  }
};

const doCancel = () => {
  isEditMode.value = false;
  syncFormData(); // Reset form data
  router.push('/profile');
};

// Watch for route changes to update edit mode
watch(() => route.path, (newPath) => {
  isEditMode.value = newPath.includes('/edit');
  if (isEditMode.value) {
    syncFormData();
  }
});

// Watch for prop changes
watch(() => props.editMode, (newMode) => {
  isEditMode.value = newMode;
  if (isEditMode.value) {
    syncFormData();
  }
});

onMounted(() => {
  loadProfile();
  // Set edit mode based on current route
  isEditMode.value = route.path.includes('/edit') || props.editMode;
});
</script>

<style scoped>
.bg-gray-50 {
  background-color: #f9fafb;
}

.opacity-50 {
  opacity: 0.5;
}
</style>
