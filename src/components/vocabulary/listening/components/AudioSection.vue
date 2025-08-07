<template>
  <div class="audio-section">
    <button class="play-btn" @click="$emit('play-audio')" :disabled="isPlaying">
      <i :class="isPlaying ? 'ri-loader-4-line spinning' : 'ri-volume-up-line'"></i>
      {{ isPlaying ? '播放中...' : '播放例句' }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean
}>()

defineEmits(['play-audio'])
</script>

<style lang="scss" scoped>
.audio-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  i {
    font-size: 1.2rem;
    
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>