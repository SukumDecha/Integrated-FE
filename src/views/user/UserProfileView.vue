<template>
  <XBreadcrumb :items="breadcrumbs" />

  <UserProfileForm />
</template>

<script setup>
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import UserProfileForm from '@/components/user/UserProfileForm.vue'

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Profile', active: true },
]
</script>
