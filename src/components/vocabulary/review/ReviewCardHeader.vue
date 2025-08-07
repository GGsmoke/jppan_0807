<template>
  <div class="card-header">
    <div :class="['level-badge', getLevelClass(currentWord.level)]">{{ currentWord.level }}</div>
    <div class="progress">{{ currentIndex + 1 }} / {{ filteredWords.length }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentWord: {
    id: string
    kanji: string
    kana: string
    meaning: string
    level: string
    example?: string
    exampleMeaning?: string
  }
  currentIndex: number
  filteredWords: any[]
}>()

const getLevelClass = (level: string) => {
  switch (level) {
    case 'N5': return 'level-n5'
    case 'N4': return 'level-n4'
    case 'N3': return 'level-n3'
    case 'N2': return 'level-n2'
    case 'N1': return 'level-n1'
    default: return ''
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  
  .level-badge {
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
  
  .progress {
    font-size: 0.9rem;
    color: #666;
    background: #f0f0f0;
    padding: 4px 10px;
    border-radius: 20px;
  }
}
</style>