<template>
  <div class="question-footer">
    <button class="btn-next" @click="$emit('next-question')">
      {{ isLastQuestion ? '完成练习' : '下一题' }}
      <i class="ri-arrow-right-line"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLastQuestion: boolean
}>()

defineEmits(['next-question'])
</script>

<style lang="scss" scoped>
.question-footer {
  padding: var(--spacing-lg);
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.btn-next {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  i {
    transition: transform var(--transition-fast);
  }
  
  &:hover i {
    transform: translateX(4px);
  }
}
</style>