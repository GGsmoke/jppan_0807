<template>
  <div class="conversation-page">
    <div class="page-header">
      <div class="container">
        <h1>会话练习</h1>
        <p>提高日语口语交际能力</p>
      </div>
    </div>

    <div class="container">
      <ConversationPractice />
    </div>
  </div>
</template>

<script setup lang="ts">
import ConversationPractice from '../components/conversation/ConversationPractice.vue'
</script>

<style lang="scss" scoped>
.conversation-page {
  padding-bottom: var(--spacing-xxl);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
}
</style>