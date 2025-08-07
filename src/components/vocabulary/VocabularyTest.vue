<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  level: string
  explanationUrl?: string
}

interface Question {
  word: Word
  options: string[]
  correctIndex: number
}

interface TestResult {
  score: number
  correct: number
  total: number
  time: number
  questions: {
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanationUrl?: string
  }[]
}

const props = defineProps<{
  words: Word[]
  testOptions: {
    count: string
    type: string
  }
}>()

const emit = defineEmits(['test-complete', 'abort-test', 'play-explanation-video'])

const authStore = useAuthStore()
const currentIndex = ref(0)
const selectedAnswer = ref(-1)
const showAnswer = ref(false)
const testCompleted = ref(false)
const timer = ref(0)
const timerInterval = ref<number | null>(null)
const userAnswers = ref<number[]>([])
const testResults = ref<{
  questions: {
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanationUrl?: string
  }[]
}>({
  questions: []
})
const showAudioPermissionDialog = ref(false)
const isTransitioning = ref(false)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)
const explanationVideo = ref<HTMLVideoElement | null>(null)

const currentWord = computed(() => {
  return props.words[currentIndex.value]
})

const isLastQuestion = computed(() => {
  return currentIndex.value === props.words.length - 1
})

const isFirstQuestion = computed(() => {
  return currentIndex.value === 0
})

const isAnswerCorrect = computed(() => {
  return selectedAnswer.value === currentQuestion.value.correctIndex
})

const currentQuestion = computed(() => {
  const word = currentWord.value || { id: '', kanji: '', kana: '', meaning: '', level: '' }
  
  const options: string[] = []
  let correctIndex = 0
  
  if (props.testOptions.type === 'meaning') {
    // 日译中测试
    correctIndex = Math.floor(Math.random() * 4)
    
    // 添加正确选项
    options[correctIndex] = word.meaning
    
    // 添加干扰选项
    const otherWords = props.words.filter(w => w.id !== word.id)
    for (let i = 0; i < 4; i++) {
      if (i !== correctIndex) {
        const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)]
        options[i] = randomWord.meaning
        // 从干扰选项中移除已使用的单词
        otherWords.splice(otherWords.indexOf(randomWord), 1)
      }
    }
  } else if (props.testOptions.type === 'reading') {
    // 假名选择测试
    correctIndex = Math.floor(Math.random() * 4)
    
    // 添加正确选项
    options[correctIndex] = word.kana
    
    // 添加干扰选项
    const otherWords = props.words.filter(w => w.id !== word.id)
    for (let i = 0; i < 4; i++) {
      if (i !== correctIndex) {
        const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)]
        options[i] = randomWord.kana
        // 从干扰选项中移除已使用的单词
        otherWords.splice(otherWords.indexOf(randomWord), 1)
      }
    }
  } else if (props.testOptions.type === 'kanji') {
    // 汉字选择测试
    correctIndex = Math.floor(Math.random() * 4)
    
    // 添加正确选项
    options[correctIndex] = word.kanji
    
    // 添加干扰选项
    const otherWords = props.words.filter(w => w.id !== word.id)
    for (let i = 0; i < 4; i++) {
      if (i !== correctIndex) {
        const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)]
        options[i] = randomWord.kanji
        // 从干扰选项中移除已使用的单词
        otherWords.splice(otherWords.indexOf(randomWord), 1)
      }
    }
  }
  
  return {
    word,
    options,
    correctIndex
  }
})

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

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  timerInterval.value = window.setInterval(() => {
    timer.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const selectAnswer = (index: number) => {
  selectedAnswer.value = index
  showAnswer.value = true
  
  // 记录答案
  userAnswers.value[currentIndex.value] = index
  
  // 记录测试结果
  const question = currentQuestion.value
  const isCorrect = index === question.correctIndex
  
  testResults.value.questions.push({
    question: props.testOptions.type === 'meaning' ? question.word.kanji : 
              props.testOptions.type === 'reading' ? question.word.kanji : 
              question.word.kana,
    userAnswer: question.options[index],
    correctAnswer: question.options[question.correctIndex],
    isCorrect,
    explanationUrl: question.word.explanationUrl
  })
}

const prevQuestion = async () => {
  if (isFirstQuestion.value) return
  
  // 停止所有音频播放
  stopAllAudio()
  
  // 添加过渡动画
  isTransitioning.value = true
  
  setTimeout(() => {
    // 重置当前题目状态
    selectedAnswer.value = -1
    showAnswer.value = false
    
    // 移除当前题目的结果记录
    if (testResults.value.questions.length > 0) {
      testResults.value.questions.pop()
    }
    
    // 返回上一题
    currentIndex.value--
    isTransitioning.value = false
  }, 300)
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    completeTest()
  } else {
    skipToNextQuestion()
  }
}

const skipToNextQuestion = () => {
  if (!showAnswer.value) {
    if (isLastQuestion.value) {
      // 最后一题直接完成
      completeTest()
      return
    } else {
      // 记录跳过的题目
      const question = currentQuestion.value
      testResults.value.questions.push({
        question: props.testOptions.type === 'meaning' ? question.word.kanji : 
                  props.testOptions.type === 'reading' ? question.word.kanji : 
                  question.word.kana,
        userAnswer: '跳过',
        correctAnswer: question.options[question.correctIndex],
        isCorrect: false,
        explanationUrl: question.word.explanationUrl
      })
    }
  }
  
  // 添加过渡动画
  isTransitioning.value = true
  
  setTimeout(() => {
    if (isLastQuestion.value) {
      completeTest()
    } else {
      currentIndex.value++
      selectedAnswer.value = -1
      showAnswer.value = false
    }
    isTransitioning.value = false
  }, 500)
}

const calculateResults = () => {
  // This function calculates the final test results
  // The results are already being tracked in testResults.value.questions
  // so this function can be used for any additional calculations if needed
  const correctCount = getCorrectCount()
  const totalQuestions = props.words.length
  const score = Math.round((correctCount / totalQuestions) * 100)
  
  // Results are already stored in testResults.value.questions
  // This function is called before emitting the results
}

const completeTest = () => {
  stopTimer()
  calculateResults()
  testCompleted.value = true
  
  // 发送测试结果
  emit('test-complete', {
    score: Math.round((getCorrectCount() / props.words.length) * 100),
    correct: getCorrectCount(),
    total: props.words.length,
    time: timer.value,
    questions: testResults.value.questions
  })
}

const getCorrectCount = () => {
  return testResults.value.questions.filter(q => q.isCorrect).length
}

const abortTest = () => {
  stopTimer()
  emit('abort-test')
}

// 播放讲解视频
const playExplanationVideo = () => {
  // 在实际应用中，这里应该从currentWord中获取视频URL
  if (currentWord.value && currentWord.value.explanationUrl) {
    explanationVideoUrl.value = currentWord.value.explanationUrl
  } else {
    explanationVideoUrl.value = null
  }
  
  showVideoDialog.value = true
}

// 停止讲解视频
const stopExplanationVideo = () => {
  if (explanationVideo.value) {
    explanationVideo.value.pause()
    explanationVideo.value.currentTime = 0
  }
}

// 停止所有音频播放
const stopAllAudio = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  
  // 停止所有audio元素
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
}

onMounted(() => {
  startTimer()
  // 页面离开时停止所有音频
  window.addEventListener('beforeunload', stopAllAudio)
})

onUnmounted(() => {
  stopTimer()
  stopAllAudio()
  stopExplanationVideo()
  window.removeEventListener('beforeunload', stopAllAudio)
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    stopExplanationVideo()
  }
})

// 播放音频前检查权限
const checkAudioPermission = () => {
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return false
  }
  return true
}
</script>

<template>
  <div class="vocabulary-test">
    <div class="test-header">
      <div class="test-info">
        <h2>单词测试</h2>
        <div class="test-progress">
          <div class="progress-text">{{ currentIndex + 1 }} / {{ words.length }}</div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${(currentIndex + 1) / words.length * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="test-timer">
        <i class="ri-time-line"></i>
        <span>{{ formatTime(timer) }}</span>
      </div>
    </div>
    
    <div class="test-content">
      <div v-if="!testCompleted && currentWord && currentWord.id" class="question-card">
        <div class="question-header">
          <div :class="['level-badge', getLevelClass(currentWord.level)]">{{ currentWord.level }}</div>
          <button class="btn-abort" @click="abortTest">
            <i class="ri-close-line"></i>
            中止测试
          </button>
        </div>
        
        <div class="question-body">
          <!-- 日译中测试 -->
          <template v-if="testOptions.type === 'meaning'">
            <div class="question">
              <h3 class="question-word">{{ currentWord.kanji }}</h3>
              <p class="question-kana">{{ currentWord.kana }}</p>
            </div>
            
            <div class="options">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :class="['option-btn', { 
                  'selected': selectedAnswer === index,
                  'correct': showAnswer && index === currentQuestion.correctIndex,
                  'incorrect': showAnswer && selectedAnswer === index && index !== currentQuestion.correctIndex
                }]"
                @click="selectAnswer(index)"
                :disabled="showAnswer"
              >
                {{ option }}
              </button>
            </div>
          </template>
          
          <!-- 假名选择测试 -->
          <template v-else-if="testOptions.type === 'reading'">
            <div class="question">
              <h3 class="question-word">{{ currentWord.kanji }}</h3>
              <p class="question-prompt">选择正确的读音</p>
            </div>
            
            <div class="options">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :class="['option-btn', { 
                  'selected': selectedAnswer === index,
                  'correct': showAnswer && index === currentQuestion.correctIndex,
                  'incorrect': showAnswer && selectedAnswer === index && index !== currentQuestion.correctIndex
                }]"
                @click="selectAnswer(index)"
                :disabled="showAnswer"
              >
                {{ option }}
              </button>
            </div>
          </template>
          
          <!-- 汉字选择测试 -->
          <template v-else-if="testOptions.type === 'kanji'">
            <div class="question">
              <h3 class="question-word">{{ currentWord.kana }}</h3>
              <p class="question-prompt">选择正确的汉字</p>
            </div>
            
            <div class="options">
              <button 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :class="['option-btn', { 
                  'selected': selectedAnswer === index,
                  'correct': showAnswer && index === currentQuestion.correctIndex,
                  'incorrect': showAnswer && selectedAnswer === index && index !== currentQuestion.correctIndex
                }]"
                @click="selectAnswer(index)"
                :disabled="showAnswer"
              >
                {{ option }}
              </button>
            </div>
          </template>
        </div>
        
        <div class="question-footer">
          <div v-if="showAnswer" class="answer-feedback">
            <div :class="['feedback-message', isAnswerCorrect ? 'correct' : 'incorrect']">
              <i :class="isAnswerCorrect ? 'ri-check-circle-line' : 'ri-close-circle-line'"></i>
              {{ isAnswerCorrect ? '回答正确！' : '回答错误！' }}
            </div>
          </div>
          
          <div class="question-navigation">
            <button 
              class="nav-btn prev" 
              @click="prevQuestion"
              :disabled="isFirstQuestion"
            >
              <i class="ri-arrow-left-line"></i>
              上一题
            </button>
            
            <button 
              class="nav-btn next"
              @click="skipToNextQuestion"
              :disabled="isLastQuestion && !showAnswer"
              :class="{ 'transitioning': isTransitioning }"
            >
              <i v-if="isTransitioning" class="ri-loader-4-line spinning"></i>
              <span v-else>{{ showAnswer ? '下一题' : (isLastQuestion ? '完成测试' : '跳过') }}</span>
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        
        </div>
      </div>
    </div>
  </div>
  
  <!-- 音频权限弹窗 -->
  <el-dialog
    v-model="showAudioPermissionDialog"
    title="开通音频权限"
    width="360px"
    center
    :show-close="false"
    class="audio-permission-dialog"
  >
    <div class="qr-container">
      <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服二维码" class="qr-code">
      <p>扫码添加客服微信</p>
      <p class="tip">需要用户购买音频和视频播放权限</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showAudioPermissionDialog = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.vocabulary-test {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-xs);
  }
}

.test-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .progress-text {
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  .progress-bar {
    width: 150px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background-color: white;
      transition: width 0.3s ease;
    }
  }
}

.test-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-family: monospace;
  
  i {
    font-size: 1.3rem;
  }
}

.test-content {
  padding: var(--spacing-lg);
}

.question-card {
  background-color: #f5f9ff;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
  
  .level-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    
    &.level-n1 {
      background-color: #9C27B0;
    }

    &.level-n2 {
      background-color: #F44336;
    }

    &.level-n3 {
      background-color: #FF9800;
    }

    &.level-n4 {
      background-color: #2196F3;
    }

    &.level-n5 {
      background-color: #4CAF50;
    }
  }
  
  .btn-abort {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: none;
    color: #666;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      border-color: #f44336;
      color: #f44336;
    }
    
    i {
      font-size: 1rem;
    }
  }
}

.question-body {
  padding: var(--spacing-lg);
}

.question {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  .question-word {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
  
  .question-kana {
    font-size: 1.5rem;
    color: #666;
  }
  
  .question-prompt {
    font-size: 1rem;
    color: #666;
    margin-top: var(--spacing-sm);
  }
}

.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.option-btn {
  padding: var(--spacing-md);
  border: 2px solid #e0e0e0;
  border-radius: var(--border-radius);
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  
  &:hover:not(:disabled):not(.correct):not(.incorrect) {
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.05);
  }
  
  &.correct {
    border-color: #43a047;
    background-color: rgba(67, 160, 71, 0.1);
  }
  
  &.incorrect {
    border-color: #d32f2f;
    background-color: rgba(211, 47, 47, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.question-footer {
  padding: var(--spacing-md);
  background-color: white;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.answer-feedback {
  margin-bottom: var(--spacing-md);
  
  .feedback-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    
    i {
      font-size: 1.2rem;
    }
    
    &.correct {
      color: #43a047;
    }
    
    &.incorrect {
      color: #d32f2f;
    }
  }
}

.btn-explanation {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #fff3e0;
  color: #ff9800;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: #ffe0b2;
  }
  
  i {
    font-size: 1.1rem;
  }
}

.btn-next {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
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

.question-navigation {
  display: flex;
  justify-content: space-between;
  margin: var(--spacing-lg) 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.transitioning {
    opacity: 0.7;
    
    .spinning {
      animation: spin 1s linear infinite;
    }
  }
}

.video-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .video-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .explanation-video {
    width: 100%;
    border-radius: var(--border-radius);
  }

  .no-video-message {
    text-align: center;
    padding: var(--spacing-xl) 0;
    color: var(--text-light);

    i {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    p {
      font-size: 1.1rem;
    }
  }
}

.audio-permission-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .qr-container {
    text-align: center;
    padding: var(--spacing-md) 0;

    .qr-code {
      width: 200px;
      height: 200px;
      margin-bottom: var(--spacing-md);
    }

    p {
      color: var(--text-color);
      margin-bottom: var(--spacing-xs);

      &.tip {
        color: var(--text-light);
        font-size: 0.9rem;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
