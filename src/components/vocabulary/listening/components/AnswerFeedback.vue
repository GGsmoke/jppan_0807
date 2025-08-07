<template>
  <div class="answer-feedback">
    <div class="feedback-header">
      <div class="match-score">
        <span>匹配度：</span>
        <div class="score-bar">
          <div class="score-fill" :style="{ width: `${matchScore}%` }"></div>
        </div>
        <span class="score-value">{{ matchScore }}%</span>
      </div>
    </div>
    
    <div class="comparison-section">
      <div class="comparison-item">
        <h4>您的答案：</h4>
        <p class="jp-text">{{ userAnswer }}</p>
      </div>
      
      <div class="comparison-item correct">
        <h4>正确答案：</h4>
        <p class="jp-text">{{ currentWord.example }}</p>
        <p class="cn-text">{{ currentWord.exampleMeaning }}</p>
        <button class="play-example-btn" @click="$emit('play-audio')">
          <i class="ri-volume-up-line"></i>
          再次播放
        </button>
      </div>
    </div>
    
    <div class="word-info">
      <div class="word-header">
        <div class="kanji">{{ currentWord.kanji }}</div>
        <div class="kana">{{ currentWord.kana }}</div>
      </div>
      <div class="meaning">{{ currentWord.meaning }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  matchScore: number
  userAnswer: string
  currentWord: {
    kanji: string
    kana: string
    meaning: string
    example: string
    exampleMeaning: string
  }
}>()

defineEmits(['play-audio'])
</script>

<style lang="scss" scoped>
.answer-feedback {
  background-color: var(--background-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);
}

.feedback-header {
  margin-bottom: var(--spacing-md);
}

.match-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .score-bar {
    flex: 1;
    height: 10px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    overflow: hidden;
    
    .score-fill {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.5s ease;
    }
  }
  
  .score-value {
    font-weight: 500;
    min-width: 40px;
    text-align: right;
  }
}

.comparison-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.comparison-item {
  background-color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  
  &.correct {
    border-left: 3px solid var(--primary-color);
  }
  
  h4 {
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
  }
  
  .jp-text {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-xs);
  }
  
  .cn-text {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: var(--spacing-sm);
  }
  
  .play-example-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0;
    font-size: 0.9rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.word-info {
  background-color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  
  .word-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
    
    .kanji {
      font-size: 1.5rem;
      color: var(--primary-color);
      font-weight: 500;
    }
    
    .kana {
      font-size: 1rem;
      color: var(--text-light);
    }
  }
  
  .meaning {
    font-size: 1rem;
  }
}
</style>