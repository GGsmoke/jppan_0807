<template>
  <div class="practice-header">
    <div class="header-content">
      <div class="header-title">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      
      <div class="level-filters">
        <button 
          v-for="level in levelOptions" 
          :key="level"
          :class="['level-btn', { active: currentLevel === level }]"
          @click="$emit('level-change', level)"
        >
          {{ level }}
        </button>
      </div>
      
      <div class="count-selector">
        <label>例句数量</label>
        <select :value="wordCount" @change="handleCountChange">
          <option v-for="option in countOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <button class="btn-start-practice" @click="$emit('start-practice')">
        开始练习
        <i class="ri-arrow-right-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  levelOptions: string[]
  countOptions: { value: string, label: string }[]
  currentLevel: string
  wordCount: string
}>()

const emit = defineEmits(['level-change', 'count-change', 'start-practice'])

const handleCountChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('count-change', target.value)
}
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
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
  
  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .header-title {
    text-align: center;
    margin-bottom: var(--spacing-md);
    
    h2 {
      font-size: 1.8rem;
      margin-bottom: var(--spacing-xs);
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    p {
      opacity: 0.9;
      font-size: 1.1rem;
      font-weight: 300;
    }
  }
}

.level-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  
  .level-btn {
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
    font-weight: 500;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &.active {
      background-color: white;
      border-color: white;
      color: var(--primary-color);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }
}

.count-selector {
  margin-bottom: var(--spacing-md);
  text-align: center;
  
  label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  select {
    padding: 10px 20px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    width: 150px;
    cursor: pointer;
    font-size: 0.95rem;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    padding-right: 30px;
    
    &:focus {
      outline: none;
      border-color: white;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
    }
    
    option {
      background-color: var(--primary-color);
      color: white;
    }
  }
}

.btn-start-practice {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  color: var(--primary-color);
  border: none;
  padding: 12px 30px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: var(--spacing-md);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  i {
    transition: transform var(--transition-fast);
  }

  &:hover i {
    transform: translateX(4px);
  }
}
</style>