<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import VocabularyTest from './VocabularyTest.vue'
import VideoDialog from './VideoDialog.vue'

const props = defineProps<{
  words: any[]
  testLevel: string
  testCount: string
  testType: string
  testStarted: boolean
  testCompleted: boolean
  testResults: any
}>()

const emit = defineEmits([
  'update:test-level', 
  'update:test-count', 
  'update:test-type',
  'update:test-started',
  'update:test-completed',
  'update:test-results',
  'start-test',
  'retry-test',
  'back-to-setup'
])

// 结果标签页
const resultTab = ref('summary')

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 测试类型选项
const testTypes = [
  { id: 'meaning', name: '日译中（这个简单）' },
  { id: 'reading', name: '选择读音' },
  { id: 'kanji', name: '选择汉字' }
]

// 更新测试等级
const updateTestLevel = (level: string) => {
  emit('update:test-level', level)
}

// 更新测试数量
const updateTestCount = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:test-count', target.value)
}

// 更新测试类型
const updateTestType = (type: string) => {
  emit('update:test-type', type)
}

// 开始测试
const startTest = () => {
  emit('start-test')
}

// 处理测试完成
const handleTestComplete = (results: any) => {
  emit('update:test-results', results)
  emit('update:test-completed', true)
}

// 中止测试
const abortTest = () => {
  emit('update:test-started', false)
}

// 重新测试
const retryTest = () => {
  emit('retry-test')
}

// 返回测试设置
const backToSetup = () => {
  emit('back-to-setup')
}

// 播放讲解视频
const playExplanationVideo = (question: any) => {
  // 在实际应用中，这里应该从question中获取视频URL
  if (question && question.explanationUrl) {
    explanationVideoUrl.value = question.explanationUrl
  } else {
    explanationVideoUrl.value = null
  }
  
  showVideoDialog.value = true
}

// 格式化时间
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 停止所有音频
const stopAllAudio = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
})
</script>

<template>
  <div class="test-mode">
    <div v-if="!testStarted" class="test-setup">
      <h2>要不来练一下？</h2>
      <p>测测你的单词量到底什么水平！</p>
      
      <div class="setup-options">
        <div class="setup-section">
          <h3>选择等级</h3>
          <div class="level-options">
            <button 
              v-for="level in ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']" 
              :key="level"
              :class="['level-option', { active: testLevel === level }]"
              @click="updateTestLevel(level)"
            >
              {{ level }}
            </button>
          </div>
        </div>
        
        <div class="setup-section">
          <h3>题目数量</h3>
          <select :value="testCount" @change="updateTestCount">
            <option value="10">10题</option>
            <option value="20">20题</option>
            <option value="30">30题</option>
          </select>
        </div>
        
        <div class="setup-section">
          <h3>测试类型</h3>
          <div class="test-types">
            <button 
              v-for="type in testTypes" 
              :key="type.id"
              :class="['test-type', { active: testType === type.id }]"
              @click="updateTestType(type.id)"
            >
              {{ type.name }}
            </button>
          </div>
        </div>
      </div>
      
      <button class="btn-start-test" @click="startTest">
        开始测试
        <i class="ri-arrow-right-line"></i>
      </button>
    </div>
    
    <VocabularyTest 
      v-if="testStarted && !testCompleted"
      :words="words"
      :testOptions="{ count: testCount, type: testType }"
      @test-complete="handleTestComplete"
      @abort-test="abortTest"
      @play-explanation-video="playExplanationVideo"
    />
    
    <div v-if="testCompleted" class="test-results">
      <div class="results-header">
        <h2>测试结果</h2>
        <div class="score-display">
          <div class="score">{{ testResults.score }}</div>
          <div class="score-label">分数</div>
        </div>
      </div>
      
      <div class="results-tabs">
        <button 
          :class="['tab-btn', { active: resultTab === 'summary' }]"
          @click="resultTab = 'summary'"
        >
          <i class="ri-bar-chart-line"></i>
          成绩统计
        </button>
        <button 
          :class="['tab-btn', { active: resultTab === 'details' }]"
          @click="resultTab = 'details'"
        >
          <i class="ri-file-list-line"></i>
          答题详情
        </button>
      </div>
      
      <div class="results-content">
        <!-- 成绩统计 -->
        <div v-if="resultTab === 'summary'" class="summary-tab">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ testResults.correct }}</div>
              <div class="stat-label">正确题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ testResults.total }}</div>
              <div class="stat-label">总题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ Math.round((testResults.correct / testResults.total) * 100) }}%</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatTime(testResults.time) }}</div>
              <div class="stat-label">用时</div>
            </div>
          </div>
          
          <div class="chart-container">
            <div class="placeholder-chart">
              <div class="chart-bar correct" :style="{ width: `${(testResults.correct / testResults.total) * 100}%` }">
                <span>正确: {{ testResults.correct }}</span>
              </div>
              <div class="chart-bar incorrect" :style="{ width: `${((testResults.total - testResults.correct) / testResults.total) * 100}%` }">
                <span>错误: {{ testResults.total - testResults.correct }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 答题详情 -->
        <div v-if="resultTab === 'details'" class="details-tab">
          <div 
            v-for="(question, index) in testResults.questions" 
            :key="index"
            :class="['question-result', { correct: question.isCorrect, incorrect: !question.isCorrect }]"
          >
            <div class="question-header">
              <div class="question-number">问题 {{ index + 1 }}</div>
              <div class="question-status">
                <i :class="question.isCorrect ? 'ri-check-line' : 'ri-close-line'"></i>
                {{ question.isCorrect ? '正确' : '错误' }}
              </div>
            </div>
            
            <div class="question-content">
              <p class="question-text">{{ question.question }}</p>
              <div class="answer-info">
                <div class="your-answer" :class="{ wrong: !question.isCorrect }">
                  您的答案: {{ question.userAnswer }}
                </div>
                <div v-if="!question.isCorrect" class="correct-answer">
                  正确答案: {{ question.correctAnswer }}
                </div>
              </div>
            </div>
            
            <button class="btn-explanation" @click="playExplanationVideo(question)">
              <i class="ri-video-line"></i>
              观看讲解视频
            </button>
          </div>
        </div>
      </div>
      
      <div class="results-actions">
        <button class="btn-retry" @click="retryTest">
          <i class="ri-restart-line"></i>
          重新测试
        </button>
        <button class="btn-back" @click="backToSetup">
          <i class="ri-arrow-left-line"></i>
          返回
        </button>
      </div>
    </div>
    
    <!-- 视频讲解弹窗 -->
    <VideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
  </div>
</template>

<style lang="scss" scoped>
.test-setup {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;

  h2 {
    font-size: 1.8rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }

  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-xl);
  }
}

.setup-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.setup-section {
  h3 {
    font-size: 1.2rem;
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
  }

  select {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    width: 200px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.level-options,
.test-types {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.level-option,
.test-type {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: none;
  cursor: pointer;
  transition: all var(--transition-fast);

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

.btn-start-test {
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
  }

  i {
    transition: transform var(--transition-fast);
  }

  &:hover i {
    transform: translateX(4px);
  }
}

.test-results {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  max-width: 800px;
  margin: 0 auto;
}

.results-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h2 {
    font-size: 1.8rem;
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
  }
}

.score-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--primary-color);
  color: white;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  justify-content: center;
}

.score {
  font-size: 2.5rem;
  font-weight: 700;
}

.score-label {
  font-size: 1rem;
}

.results-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.results-tabs .tab-btn {
  flex: 1;
  padding: var(--spacing-md);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;

  &:hover {
    color: var(--primary-color);
  }

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-light);
}

.chart-container {
  margin-bottom: var(--spacing-xl);
}

.placeholder-chart {
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
}

.chart-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  transition: width 0.5s ease;
}

.chart-bar.correct {
  background-color: var(--success-color);
}

.chart-bar.incorrect {
  background-color: var(--error-color);
}

.question-result {
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-left: 4px solid transparent;
}

.question-result.correct {
  border-left-color: var(--success-color);
}

.question-result.incorrect {
  border-left-color: var(--error-color);
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.question-number {
  font-weight: 500;
}

.question-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.question-result.correct .question-status {
  color: var(--success-color);
}

.question-result.incorrect .question-status {
  color: var(--error-color);
}

.question-content {
  margin-bottom: var(--spacing-sm);
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: var(--spacing-sm);
}

.answer-info {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.your-answer.wrong {
  color: var(--error-color);
}

.correct-answer {
  color: var(--success-color);
}

.btn-explanation {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;

  &:hover {
    background-color: var(--primary-dark);
  }
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.btn-retry,
.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.btn-retry {
  background-color: var(--primary-color);
  color: white;
  border: none;

  &:hover {
    background-color: var(--primary-dark);
  }
}

.btn-back {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}
</style>
