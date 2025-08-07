<template>
  <div class="review-complete">
    <div class="complete-icon">
      <i class="ri-check-double-line"></i>
    </div>
    <h3>恭喜！今日复习完成</h3>
    <p>你已完成所有单词的复习，明天再来继续学习吧！</p>
    <div class="complete-stats">
      <div class="stat-item">
        <div class="stat-value">{{ reviewStats.completed }}</div>
        <div class="stat-label">已复习</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ reviewStats.mastered }}</div>
        <div class="stat-label">已掌握</div>
      </div>
    </div>
    <button class="btn-restart" @click="$emit('restart-review')">
      <i class="ri-restart-line"></i>
      重新开始复习
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  reviewStats: {
    completed: number
    mastered: number
  }
}>()

defineEmits(['restart-review'])
</script>

<style lang="scss" scoped>
.review-complete {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  
  .complete-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-lg);
    
    i {
      font-size: 2.5rem;
    }
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }
  
  p {
    color: #666;
    margin-bottom: var(--spacing-lg);
  }
}

.complete-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  
  .stat-item {
    text-align: center;
    background-color: #f5f9ff;
    padding: 15px 25px;
    border-radius: 10px;
    min-width: 100px;
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .stat-label {
      color: #666;
    }
  }
}

.btn-restart {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  }
  
  i {
    font-size: 1.2rem;
  }
}
</style>