<template>
  <XBreadcrumb :items="breadcrumbs" />

  <UserProfileForm edit-mode="true" />
</template>

<script setup>
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue';
import UserProfileForm from '@/components/user/UserProfileForm.vue';

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Profile', path: '/profile' },
  { text: 'Edit', active: true },
]

</script>

