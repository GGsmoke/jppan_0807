<script setup lang="ts">
const props = defineProps<{
  currentLevel: string
  levels: string[]
}>()

const emit = defineEmits(['change-level'])

const setLevel = (level: string) => {
  emit('change-level', level)
}
</script>

<template>
  <div class="level-filter">
    <button 
      v-for="level in levels" 
      :key="level"
      :class="['level-btn', { active: currentLevel === level }]"
      @click="setLevel(level)"
    >
      {{ level }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.level-filter {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.level-btn {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}
</style>