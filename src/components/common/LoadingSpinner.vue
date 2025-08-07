<template>
  <div class="loading-spinner" v-if="show">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  text?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.loading-spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-container {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  color: var(--text-color);
  font-size: 1rem;
  margin: 0;
}
</style>