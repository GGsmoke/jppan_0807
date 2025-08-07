<template>
  <div class="exam-header">
    <div class="container">
      <div class="header-content">
        <div class="exam-progress">
          <div class="progress-text">
            {{ isCombinationQuestion ? `组${currentGroupIndex + 1}/${totalGroups}` : `第 ${currentQuestionIndex + 1}/${questions.length} 题` }}
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${(currentGroupIndex + 1) / totalGroups * 100}%` }"
            ></div>
          </div>
        </div>
        <div class="exam-timer" v-if="!isRandomPractice">
          <i class="ri-time-line"></i>
          <span :class="{ 'time-warning': remainingTime <= 300 }">
            {{ formatTime(remainingTime) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentGroupIndex: number
  totalGroups: number
  currentQuestionIndex: number
  questions: any[]
  isCombinationQuestion: boolean
  isRandomPractice: boolean
  remainingTime: number
}

defineProps<Props>()

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.exam-header {
  background-color: white;
  padding: var(--spacing-md) 0;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.exam-progress {
  flex: 1;
  max-width: 400px;

  .progress-text {
    margin-bottom: 5px;
    font-size: 0.9rem;
    color: var(--text-light);
  }

  .progress-bar {
    height: 6px;
    background-color: var(--background-color);
    border-radius: 3px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }
  }
}

.exam-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-family: monospace;

  i {
    color: var(--text-light);
  }

  .time-warning {
    color: var(--error-color);
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>