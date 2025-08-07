<template>
  <div class="question-container">
    <div class="question-header">
      <h3 class="question-number">Q{{ questionIndex + 1 }}</h3>
      <div class="question-meta">
        <span class="difficulty-badge" :class="getDifficultyClass()">
          {{ question.jlptLevel || '加油' }}
        </span>
      </div>
    </div>
    
    <p class="question-text jp-text">{{ question.questionStem }}</p>
    
    <div class="answer-options">
      <label 
        v-for="(option, index) in question.options.split('|')" 
        :key="index"
        :class="[
          'option-item',
          {
            'selected': getUserAnswer(question.questionId) === index,
            'correct': isRandomPractice && hasAnsweredQuestion(question.questionId) && index === parseInt(question.answer) - 1,
            'incorrect': isRandomPractice && hasAnsweredQuestion(question.questionId) && getUserAnswer(question.questionId) === index && index !== parseInt(question.answer) - 1
          }
        ]"
      >
        <input 
          type="radio" 
          :name="`question_${question.questionId}`"
          :value="index"
          :checked="getUserAnswer(question.questionId) === index"
          :disabled="isRandomPractice && hasAnsweredQuestion(question.questionId)"
          @change="handleAnswerSelect(question.questionId, index)"
        >
        <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
        <span class="option-text jp-text">{{ option.trim() }}</span>
        <img 
          v-if="getOptionImage(question, index)" 
          :src="getOptionImage(question, index)" 
          :alt="`选项${String.fromCharCode(65 + index)}图片`" 
          class="option-image"
          @load="handleImageLoad"
          @error="handleImageError"
        >
      </label>
    </div>

    <!-- 随机练习模式的反馈 -->
    <div v-if="isRandomPractice && hasAnsweredQuestion(question.questionId)" class="answer-feedback">
      <div :class="['feedback-message', isAnswerCorrect(question.questionId) ? 'correct' : 'incorrect']">
        <i :class="isAnswerCorrect(question.questionId) ? 'ri-check-circle-line' : 'ri-close-circle-line'"></i>
        {{ isAnswerCorrect(question.questionId) ? '回答正确！' : '回答错误！' }}
        <span class="correct-answer" v-if="!isAnswerCorrect(question.questionId)">
          正确答案：{{ String.fromCharCode(65 + parseInt(question.answer) - 1) }}
        </span>
      </div>
      
      <div class="feedback-actions">
        <button class="btn-explanation" @click="$emit('toggleExplanation', question.questionId)">
          {{ showExplanation[question.questionId] ? '隐藏解析' : '查看解析' }}
          <i :class="showExplanation[question.questionId] ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
        </button>
        
        <button 
          v-if="question.explanationUrl"
          class="btn-video" 
          @click="playExplanationVideo"
        >
          <i class="ri-video-line"></i>
          讲解视频
          <span v-if="!hasVideoPermission" class="vip-badge">
            <i class="ri-vip-crown-line"></i>
            VIP
          </span>
        </button>
      </div>
      
      <div v-if="showExplanation[question.questionId]" class="explanation-content">
        <div v-if="isListeningQuestion && question.hearingText">
          <div class="explanation-section">
            <div class="explanation-title">
              <i class="ri-volume-up-line"></i>
              听力原文
            </div>
            <p class="jp-text" style="white-space: pre-line">
              {{ question.hearingText.replace(/<br>/g, '\n') }}
            </p>
          </div>
        </div>
        
        <div v-if="question.analysis" class="explanation-section">
          <div class="explanation-title">
            <i class="ri-lightbulb-line"></i>
            解析
          </div>
          <p style="white-space: pre-line">
            {{ (question.analysis || '').replace(/<br>/g, '\n') }}
          </p>
        </div>
        
        <div v-if="!question.analysis && !question.hearingText" class="explanation-section">
          <div class="explanation-title">
            <i class="ri-information-line"></i>
            提示
          </div>
          <p>暂无详细解析，建议查阅相关学习资料。</p>
        </div>
      </div>
    </div>

    <!-- 答题进度指示器 -->
    <div class="question-progress" v-if="!isRandomPractice">
      <div class="progress-indicator">
        <span class="progress-text">题目进度</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${getAnswerProgress()}%` }"
          ></div>
        </div>
        <span class="progress-percentage">{{ getAnswerProgress() }}%</span>
      </div>
    </div>
  </div>
  
  <!-- 视频权限弹窗 -->
  <el-dialog
    v-model="showVideoPermissionDialog"
    title="开通视频权限"
    width="360px"
    center
    :show-close="false"
    class="video-permission-dialog"
  >
    <div class="qr-container">
      <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服二维码" class="qr-code">
      <p>扫码添加客服微信</p>
      <p class="tip">需要用户购买讲解视频播放权限</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showVideoPermissionDialog = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 视频讲解弹窗 -->
  <el-dialog
    v-model="showVideoDialog"
    title="视频讲解"
    width="640px"
    center
    :show-close="false"
    class="video-dialog"
    @closed="stopExplanationVideo"
  >
    <div v-if="explanationVideoUrl" class="video-container">
      <video ref="explanationVideo" controls class="explanation-video" controlsList="nodownload nofullscreen" 
        disablePictureInPicture 
        disableRemotePlayback>
        <source :src="explanationVideoUrl" type="video/mp4">
        您的设备不支持视频播放
      </video>
    </div>
    <div v-else class="no-video-message">
      <i class="ri-film-line"></i>
        <p>纯纯老师的讲解视频正在精心制作中，期待与你相见～</p>
        <p>请关注我们的企微和抖音,您的支持是我们最大的动力</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showVideoDialog = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { getVideoUrl } from '../../utils/crypto'
import { useAuthStore } from '../../stores/auth'

interface Props {
  question: any
  questionIndex: number
  groupIndex: number
  userAnswers: Record<number, number>
  isRandomPractice: boolean
  showExplanation: Record<number, boolean>
  isLastGroup: boolean
  totalQuestions?: number
}

const props = defineProps<Props>()
const emit = defineEmits(['answerSelect', 'toggleExplanation', 'play-explanation-video'])

const authStore = useAuthStore()
const audioPlayer = ref<HTMLAudioElement | null>(null)
const audioStatus = ref('')
const currentPlaybackRate = ref(1.0)

// 视频讲解状态
const showVideoDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)
const explanationVideo = ref<HTMLVideoElement | null>(null)

const isListeningQuestion = computed(() => {
  return props.question.hearingUrl !== null && props.question.hearingUrl !== undefined && props.question.hearingUrl !== ''
})

const hasVideoPermission = computed(() => {
  return (authStore.userInfo?.isPaid || 0) >= 3
})

const getDifficultyClass = () => {
  const level = props.question.jlptLevel || 'N5'
  return `difficulty-${level.toLowerCase()}`
}

const getOptionImage = (question: any, index: number) => {
  const images = [
    question.optionAImage,
    question.optionBImage,
    question.optionCImage,
    question.optionDImage
  ]
  return images[index]
}

const getUserAnswer = (questionId: number) => {
  return props.userAnswers[questionId] ?? -1
}

const hasAnsweredQuestion = (questionId: number) => {
  return typeof props.userAnswers[questionId] !== 'undefined'
}

const isAnswerCorrect = (questionId: number) => {
  return getUserAnswer(questionId) === parseInt(props.question.answer) - 1
}

const getAnswerProgress = () => {
  if (!props.totalQuestions) return 0
  const answeredCount = Object.keys(props.userAnswers).length
  return Math.round((answeredCount / props.totalQuestions) * 100)
}

const handleAnswerSelect = (questionId: number, answerIndex: number) => {
  // 当选择答案时暂停音频
  pauseAndResetAudio()
  
  props.userAnswers[questionId] = answerIndex
  emit('answerSelect', questionId)
}

const setPlaybackRate = (rate: number) => {
  currentPlaybackRate.value = rate
  if (audioPlayer.value) {
    audioPlayer.value.playbackRate = rate
    audioStatus.value = `${rate}x 倍速播放`
    setTimeout(() => {
      audioStatus.value = ''
    }, 2000)
  }
}

const onAudioPlay = (event: Event) => {
  const audio = event.target as HTMLAudioElement
  audio.playbackRate = currentPlaybackRate.value
  audioStatus.value = '播放中...'
}

const onAudioEnded = () => {
  audioStatus.value = '播放完毕'
  setTimeout(() => {
    audioStatus.value = ''
  }, 2000)
}

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.classList.add('loaded')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.classList.add('error')
  img.alt = '图片加载失败'
}

// 播放讲解视频
const playExplanationVideo = () => {
  // 检查视频权限
  if (!hasVideoPermission.value) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!props.question || !props.question.explanationUrl) {
    explanationVideoUrl.value = null
    showVideoDialog.value = true
    return
  }
  
  const videoUrl = getVideoUrl(props.question.explanationUrl)
  if (videoUrl) {
    explanationVideoUrl.value = videoUrl
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

// 暂停并重置音频播放状态
const pauseAndResetAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
}

// 组件卸载时停止所有音频和视频
onUnmounted(() => {
  pauseAndResetAudio()
  stopExplanationVideo()
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    stopExplanationVideo()
  }
})

// 导出暂停音频方法，供父组件调用
defineExpose({
  pauseAndResetAudio
})
</script>

<style lang="scss" scoped>
.question-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-color);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  
  .question-number {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  .question-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;

  &.difficulty-n1 { background-color: #9C27B0; }
  &.difficulty-n2 { background-color: #F44336; }
  &.difficulty-n3 { background-color: #FF9800; }
  &.difficulty-n4 { background-color: #2196F3; }
  &.difficulty-n5 { background-color: #4CAF50; }
}

.audio-player {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  
  audio {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
  
  .playback-controls {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
    margin-bottom: var(--spacing-sm);
    
    .rate-btn {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      background: white;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 0.9rem;
      
      &.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      &:hover:not(.active) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }
  
  .audio-status {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-light);
    font-style: italic;
  }
}

.question-image {
  margin-bottom: var(--spacing-lg);
  text-align: center;

  .question-img {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 1;
    }
    
    &.error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
  }
}

.question-text {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-lg);
  line-height: 1.8;
  color: var(--text-color);
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: white;

  input {
    margin-top: 5px;
    margin-right: var(--spacing-md);
    cursor: pointer;
  }

  .option-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--background-color);
    color: var(--text-color);
    font-weight: 500;
    font-size: 0.9rem;
    margin-right: var(--spacing-md);
    flex-shrink: 0;
  }

  .option-text {
    flex: 1;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  &:hover:not(.selected):not(.correct):not(.incorrect) {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.05);
    
    .option-label {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &.selected {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.1);
    
    .option-label {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &.correct {
    border-color: var(--success-color);
    background-color: rgba(46, 204, 113, 0.1);
    
    .option-label {
      background-color: var(--success-color);
      color: white;
    }
  }

  &.incorrect {
    border-color: var(--error-color);
    background-color: rgba(231, 76, 60, 0.1);
    
    .option-label {
      background-color: var(--error-color);
      color: white;
    }
  }

  .option-image {
    max-width: 200px;
    margin-top: var(--spacing-sm);
    border-radius: 4px;
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 1;
    }
    
    &.error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
  }
}

.answer-feedback {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  border-left: 4px solid var(--primary-color);
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
  
  i {
    font-size: 1.2rem;
  }
  
  &.correct {
    color: var(--success-color);
  }
  
  &.incorrect {
    color: var(--error-color);
  }

  .correct-answer {
    margin-left: auto;
    font-size: 0.9rem;
    padding: 4px 8px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
  }
}

.feedback-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.btn-explanation,
.btn-video {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.btn-explanation {
  color: var(--primary-color);
  background-color: rgba(74, 144, 226, 0.1);
  
  &:hover {
    background-color: rgba(74, 144, 226, 0.2);
  }
  
  i {
    transition: transform var(--transition-fast);
  }
}

.btn-video {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.1);
  
  &:hover {
    background-color: rgba(255, 152, 0, 0.2);
  }
}

.explanation-content {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.explanation-section {
  margin-bottom: var(--spacing-md);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .explanation-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
    
    i {
      font-size: 1.1rem;
    }
  }
  
  p {
    color: var(--text-light);
    font-size: 0.95rem;
    line-height: 1.6;
    padding-left: var(--spacing-lg);
  }
}

.question-progress {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  .progress-text {
    font-size: 0.9rem;
    color: var(--text-light);
    white-space: nowrap;
  }
  
  .progress-bar {
    flex: 1;
    height: 6px;
    background-color: var(--border-color);
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }
  }
  
  .progress-percentage {
    font-size: 0.9rem;
    color: var(--text-light);
    font-weight: 500;
    white-space: nowrap;
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

.video-permission-dialog {
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

// 桌面端音频播放器样式优化
@media (min-width: 769px) {
  .audio-player {
    max-width: 600px;
    margin: 0 auto var(--spacing-lg) auto;
    padding: var(--spacing-lg);
    
    audio {
      height: 50px;
    }
  }
}
</style>
