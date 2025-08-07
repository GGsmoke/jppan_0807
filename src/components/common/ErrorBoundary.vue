<template>
  <slot v-if="!hasError" />
  <FallbackUI v-else />
</template>

<script setup>
const hasError = ref(false)
const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  hasError.value = true
  return false
})
</script>