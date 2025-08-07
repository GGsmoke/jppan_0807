<template>
  <div class="practice-header">
    <div class="progress-info">
      <span class="progress-text">{{ currentIndex + 1 }} / {{ totalCount }}</span>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(currentIndex + 1) / totalCount * 100}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentIndex: number
  totalCount: number
}>()
</script>

<style lang="scss" scoped>
.practice-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);
  
  .progress-info {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    
    .progress-text {
      text-align: center;
      margin-bottom: var(--spacing-xs);
    }
    
    .progress-bar {
      height: 8px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background-color: white;
        transition: width 0.3s ease;
      }
    }
  }
}
</style>