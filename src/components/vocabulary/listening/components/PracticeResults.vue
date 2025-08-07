<template>
  <div class="practice-results">
    <div class="results-header">
      <div class="result-icon">
        <i :class="resultIcon"></i>
      </div>
      <h2>练习完成！</h2>
      <p>{{ resultMessage }}</p>
    </div>
    
    <div class="results-stats">
      <div class="stat-item">
        <div class="stat-value">{{ Math.round(totalScore / wordsLength) }}%</div>
        <div class="stat-label">平均匹配度</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ perfectCount }}</div>
        <div class="stat-label">完全正确</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ wordsLength }}</div>
        <div class="stat-label">总题数</div>
      </div>
    </div>
    
    <div class="results-analysis">
      <h3>详细分析</h3>
      <div class="analysis-content">
        <p>您在例句拼图方面的表现{{ performanceLevel }}。</p>
        <p>建议：{{ recommendation }}</p>
      </div>
    </div>
    
    <div class="results-actions">
      <button class="btn-retry" @click="$emit('restart-practice')">
        <i class="ri-restart-line"></i>
        继续练习
      </button>
      <button class="btn-contact" @click="$emit('show-contact')">
        <i class="ri-customer-service-2-line"></i>
        联系我们
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalScore: number
  perfectCount: number
  wordsLength: number
  resultIcon: string
  resultMessage: string
  performanceLevel: string
  recommendation: string
}>()

defineEmits(['restart-practice', 'show-contact'])
</script>

<style lang="scss" scoped>
.practice-results {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.results-header {
  margin-bottom: var(--spacing-xl);
  
  .result-icon {
    font-size: 4rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }
  
  p {
    font-size: 1.2rem;
    color: var(--text-light);
  }
}

.results-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: var(--spacing-xs);
    }
    
    .stat-label {
      color: var(--text-light);
    }
  }
}

.results-analysis {
  background-color: var(--background-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  text-align: left;
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
  }
  
  .analysis-content {
    p {
      margin-bottom: var(--spacing-sm);
      line-height: 1.6;
    }
  }
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.btn-retry,
.btn-contact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-retry {
  background-color: var(--primary-color);
  color: white;
  
  &:hover {
    background-color: var(--primary-dark);
  }
}

.btn-contact {
  background-color: var(--background-color);
  color: var(--text-color);
  
  &:hover {
    background-color: var(--border-color);
  }
}
</style>