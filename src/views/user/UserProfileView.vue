<template>
  <div class="max-w-3xl mx-auto space-y-2">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div class="rounded-full h-12 w-12 border-4" />
        <div class="flex flex-col items-start gap-2">
          <h3 class="font-bold">
            Teprawin Prueksachat
          </h3>
          <p class="font-thin text-slate-700">
            ninemaster12gt@gmail.com
          </p>
        </div>
      </div>

      <XButton @click="doEdit">
        Edit
      </XButton>
    </div>

    <!-- Content -->
    <div class="grid grid-cols-2 gap-4 p-2">
      <XInput
        label="Full Name"
        placeholder="e.g. Japan"
      />

      <XInput
        label="Nickname"
        placeholder="e.g. Japan"
      />

      <XInput
        label="Email"
        placeholder="e.g. Japan"
      />

      <XInput
        label="Password"
        placeholder="e.g. Japan"
      />
    </div>

    <div className="border-b border-slate-400 my-2" />

    <div class="grid grid-cols-2 gap-4 p-2">
      <!-- Seller Only -->
      <XInput
        label="Mobile Number"
        placeholder="e.g. Japan"
      />

      <XInput
        label="Bank Account Number"
        placeholder="e.g. Japan"
      />

      <XInput
        label="Nation ID"
        placeholder="e.g. Japan"
      />

      <XInput
        label="Bank Name"
        placeholder="e.g. Japan"
      />
    </div>
  </div>
</template>

<script setup>
import XButton from '@/components/common/XButton.vue';
import XInput from '@/components/common/form/XInput.vue';
import { UserService } from '@/services';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const profile = ref({});

const doSearchProfile = async () => {
  const response = await UserService.getCurrentUser()
  profile.value = response;
}

const doEdit = () => {
  router.push('/profile/edit')
}

onMounted(doSearchProfile)
</script>

<style>

</style>
