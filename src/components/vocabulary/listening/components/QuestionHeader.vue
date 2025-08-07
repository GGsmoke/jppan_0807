<template>
  <div class="question-header">
    <div :class="['level-badge', levelClass]">{{ level }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  level: string
  levelClass: string
}>()
</script>

<style lang="scss" scoped>
.question-header {
  padding: var(--spacing-md);
  background-color: var(--background-color);
  display: flex;
  justify-content: flex-end;
}

.level-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  
  &.level-n5 { 
    background-color: #4CAF50;
  }
  &.level-n4 { 
    background-color: #2196F3;
  }
  &.level-n3 { 
    background-color: #FF9800;
  }
  &.level-n2 { 
    background-color: #F44336;
  }
  &.level-n1 { 
    background-color: #9C27B0;
  }
}
</style>