<template>
  <div class="meaning-section" :class="{ 'revealed': meaningRevealed }">
    <button v-if="!meaningRevealed" class="btn-reveal" @click="$emit('reveal-meaning')">
      <i class="ri-eye-line"></i>
      显示含义
    </button>
    <div v-else class="meaning">
      <p>{{ currentWord.meaning }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  meaningRevealed: boolean
  currentWord: {
    meaning: string
  }
}>()

defineEmits(['reveal-meaning'])
</script>

<style lang="scss" scoped>
.meaning-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--border-radius);
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.revealed {
    border-left: 4px solid var(--primary-color);
  }
  
  .btn-reveal {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .meaning {
    width: 100%;
    
    p {
      margin-bottom: 0;
      font-size: 1.2rem;
      color: var(--primary-color);
      font-weight: 500;
    }
  }
}
</style>