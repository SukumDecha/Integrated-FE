<template>
  <div class="max-w-3xl mx-auto space-y-2">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="rounded-full h-12 w-12 border-4" />
        <div class="space-y-1">
          <h3 class="font-bold">
            {{ profile.fullname }}
          </h3>
          <p class="font-thin text-slate-700">
            {{ profile.email }}
          </p>
        </div>
      </div>

      <XButton @click="doEdit">
        Edit Profile
      </XButton>
    </div>

    <!-- Buyer Profile Fields (always shown) -->
    <div class="grid grid-cols-2 gap-4 p-2">
      <XInput
        v-model="profile.nickname"
        label="Nickname"
        placeholder="Enter nickname"
        disabled
      />

      <XInput
        v-model="profile.fullname"
        label="Full Name"
        placeholder="Enter full name"
        disabled
      />

      <XInput
        v-model="profile.email"
        label="Email"
        placeholder="Enter email"
        disabled
        readonly
      />

      <XInput
        v-model="maskedPassword"
        label="Password"
        type="password"
        placeholder="••••••••"
        disabled
        readonly
      />
    </div>

    <!-- Seller Additional Fields (only shown for sellers) -->
    <div v-if="profile.userType === 'SELLER'">
      <div class="border-b border-slate-400 my-4" />

      <h4 class="font-semibold text-gray-700 mb-3">
        Seller Information
      </h4>

      <div class="grid grid-cols-2 gap-4 p-2">
        <XInput
          v-model="maskedMobileNo"
          label="Mobile Number"
          placeholder="Mobile number"
          disabled
          readonly
        />

        <XInput
          v-model="maskedBankNo"
          label="Bank Account Number"
          placeholder="Bank account number"
          disabled
          readonly
        />

        <XInput
          v-model="profile.bankName"
          label="Bank Name"
          placeholder="Bank name"
          disabled
          readonly
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import XButton from '@/components/common/XButton.vue';
import XInput from '@/components/common/form/XInput.vue';
import { AuthService } from '@/services';
import { useToastStore } from '@/stores/toast.store';
import { maskNumber } from '@/utils';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const profile = ref({});
const toast = useToastStore()

const maskedPassword = computed(() => {
  return '••••••••';
});

const maskedMobileNo = computed(() => {
  if (!profile.value.mobileNumber) return '';
  return maskNumber(profile.value.mobileNumber);
});

const maskedBankNo = computed(() => {
  if (!profile.value.bankAccount) return '';
  return maskNumber(profile.value.bankAccount);
});


const doSearchProfile = async () => {
  const response = await AuthService.getCurrentUser()

  if (response.error) {
    toast.add({ type: 'error', message: response.error })
    return;
  }

  profile.value = response.data;
}

const doEdit = () => {
  router.push('/profile/edit')
}

onMounted(doSearchProfile)
</script>

<style scoped>
/* Component specific styles if needed */
</style>
