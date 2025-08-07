<script setup lang="ts">
const props = defineProps<{
  wordCount: string
}>()

const emit = defineEmits(['change-count'])

const changeWordCount = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('change-count', target.value)
}
</script>

<template>
  <div class="count-selector">
    <label>单词数量</label>
    <select :value="wordCount" @change="changeWordCount">
      <option value="12">12个</option>
      <option value="20">20个</option>
      <option value="30">30个</option>
      <option value="40">40个</option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.count-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  label {
    font-size: 0.9rem;
    color: var(--text-light);
  }

  select {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}
</style>