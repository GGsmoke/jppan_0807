<template>
  <div class="exam-results">
    <div class="container">
      <div class="results-header">
        <div class="result-icon">
          <i :class="getResultIcon()"></i>
        </div>
        <h1>{{ isRandomPractice ? '随机练习完成' : '考试结束' }}</h1>
        <p class="result-message">{{ getResultMessage() }}</p>
        
        <div class="score-overview">
          <div class="score-card main-score">
            <div class="score-value">{{ examResults.score }}</div>
            <div class="score-label">总分</div>
            <div class="score-ring">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                  :stroke-dasharray="`${examResults.accuracy}, 100`"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
          
          <div class="score-stats">
            <div class="score-card">
              <div class="score-value">{{ examResults.correctCount }}</div>
              <div class="score-label">正确题数</div>
            </div>
            <div class="score-card">
              <div class="score-value">{{ examResults.accuracy }}%</div>
              <div class="score-label">正确率</div>
            </div>
            <div class="score-card">
              <div class="score-value">{{ isRandomPractice ? '不限时' : formatTime(examResults.timeSpent) }}</div>
              <div class="score-label">用时</div>
            </div>
          </div>
        </div>

        <div class="performance-analysis">
          <h3>成绩分析</h3>
          <div class="analysis-grid">
            <div class="analysis-item">
              <div class="analysis-label">答题速度</div>
              <div class="analysis-value">{{ getSpeedAnalysis() }}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">准确率等级</div>
              <div class="analysis-value">{{ getAccuracyLevel() }}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">建议</div>
              <div class="analysis-value">{{ getRecommendation() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="results-content">
        <div class="content-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'review' }]"
            @click="activeTab = 'review'"
          >
            <i class="ri-file-list-line"></i>
            题目回顾
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'analysis' }]"
            @click="activeTab = 'analysis'"
          >
            <i class="ri-bar-chart-line"></i>
            错题分析
          </button>
        </div>

        <div v-if="activeTab === 'review'" class="questions-review">
          <div v-for="(group, groupIndex) in questionGroups" :key="groupIndex" class="question-group-review">
            
            <div v-for="(question, questionIndex) in group" :key="questionIndex" class="question-review">
              <div class="question-header">
                <div 
                  :class="['answer-status', 
                    getUserAnswer(question.questionId) === parseInt(question.answer) - 1 ? 'correct' : 'incorrect'
                  ]"
                >
                  <i :class="getUserAnswer(question.questionId) === parseInt(question.answer) - 1 ? 
                    'ri-check-line' : 'ri-close-line'"></i>
                </div>
              </div>

              <div class="question-content">
                <p class="question-text jp-text">{{ question.questionStem }}</p>
                
                <div class="options-review">
                  <div 
                    v-for="(option, optionIndex) in question.options.split('|')" 
                    :key="optionIndex"
                    :class="['option-item',
                      {
                        'selected': getUserAnswer(question.questionId) === optionIndex,
                        'correct': parseInt(question.answer) - 1 === optionIndex,
                        'incorrect': getUserAnswer(question.questionId) === optionIndex && 
                          getUserAnswer(question.questionId) !== parseInt(question.answer) - 1
                      }
                    ]"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
                    <span class="option-text">{{ option.trim() }}</span>
                  </div>
                </div>
                
                <div class="explanation">
                  <div class="explanation-title">
                    <i class="ri-lightbulb-line"></i>
                    解析
                  </div>
                 <p style="white-space: pre-line">
                    {{ (question.hearingText || question.analysis || '暂无详细解析').replace(/<br>/g, '\n') }}
                  </p>
                  
                  <button 
                    v-if="question.explanationUrl"
                    class="btn-video" 
                    @click="playExplanationVideo(question)"
                  >
                    <i class="ri-video-line"></i>
                    讲解视频
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'analysis'" class="error-analysis">
          <div class="analysis-summary">
            <h3>错题统计</h3>
            <div class="error-stats">
              <div class="stat-item">
                <div class="stat-number">{{ getErrorCount() }}</div>
                <div class="stat-label">错题数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ getErrorRate() }}%</div>
                <div class="stat-label">错误率</div>
              </div>
            </div>
          </div>

          <div class="error-questions">
            <h4>错题详情</h4>
            <div v-if="getErrorQuestions().length === 0" class="no-errors">
              <i class="ri-check-double-line"></i>
              <p>恭喜！没有错题，继续保持！</p>
            </div>
            <div v-else class="error-list">
              <div v-for="question in getErrorQuestions()" :key="question.questionId" class="error-item">
                <div class="error-header">
                  <span class="question-id">Q{{ question.questionId }}</span>
                  <span class="error-type">{{ getErrorType(question) }}</span>
                </div>
                <p class="error-question">{{ question.questionStem }}</p>
                <div class="error-details">
                  <span class="your-answer">你的答案：{{ String.fromCharCode(65 + getUserAnswer(question.questionId)) }}</span>
                  <span class="correct-answer">正确答案：{{ String.fromCharCode(65 + parseInt(question.answer) - 1) }}</span>
                </div>
                <button  v-if="question.explanationUrl" class="btn-video" @click="playExplanationVideo(question)">
                  <i class="ri-video-line"></i>
                  讲解视频
                  <span v-if="!hasVideoPermission" class="vip-badge">
                    <i class="ri-vip-crown-line"></i>
                    VIP
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="results-actions">
        <button class="btn-secondary" @click="$emit('backToPractice')">
          <i class="ri-arrow-left-line"></i>
          返回练习
        </button>
        <button class="btn-primary" @click="retryExam">
          <i class="ri-refresh-line"></i>
          再次练习
        </button>
      </div>
    </div>

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
         您的设备暂不支持视频播放
        </video>
      </div>
      <div v-else class="no-video-message">
        <i class="ri-film-line"></i>
        <p>纯纯老师的讲解视频正在精心制作中，期待与你相见～</p>
        <p>请多关注我们的企微和抖音,您的支持是我们最大的动力</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showVideoDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { getVideoUrl } from '../../utils/crypto'
import { useAuthStore } from '../../stores/auth'

interface Props {
  isRandomPractice: boolean
  examResults: {
    score: number
    correctCount: number
    accuracy: number
    timeSpent: number
  }
  questionGroups: any[][]
  userAnswers: Record<number, number>
}

const props = defineProps<Props>()
const emit = defineEmits(['backToPractice', 'retryExam'])

const authStore = useAuthStore()
const activeTab = ref('review')

// 视频讲解状态
const showVideoDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)
const explanationVideo = ref<HTMLVideoElement | null>(null)

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const hasGroupStem = (group: any[]) => {
  return group[0].questionStem || group[0].questionStemImage || group[0].hearingUrl
}

const hasVideoPermission = computed(() => {
  return (authStore.userInfo?.isPaid || 0) >= 3
})

const getUserAnswer = (questionId: number) => {
  return props.userAnswers[questionId] ?? -1
}

const getResultIcon = () => {
  if (props.examResults.accuracy >= 90) return 'ri-trophy-line'
  if (props.examResults.accuracy >= 70) return 'ri-medal-line'
  if (props.examResults.accuracy >= 60) return 'ri-thumb-up-line'
  return 'ri-emotion-normal-line'
}

const getResultMessage = () => {
  if (props.examResults.accuracy >= 90) return '优秀！继续保持这种学习状态！'
  if (props.examResults.accuracy >= 70) return '良好！再接再厉，争取更好的成绩！'
  if (props.examResults.accuracy >= 60) return '及格！继续努力，提高准确率！'
  return '需要加强练习，建议复习相关知识点！'
}

const getSpeedAnalysis = () => {
  if (props.isRandomPractice) return '不限时练习'
  const avgTimePerQuestion = props.examResults.timeSpent / getTotalQuestions()
  if (avgTimePerQuestion < 60) return '答题较快'
  if (avgTimePerQuestion < 120) return '答题适中'
  return '答题较慢'
}

const getAccuracyLevel = () => {
  if (props.examResults.accuracy >= 90) return '优秀'
  if (props.examResults.accuracy >= 80) return '良好'
  if (props.examResults.accuracy >= 70) return '中等'
  if (props.examResults.accuracy >= 60) return '及格'
  return '需要提高'
}

const getRecommendation = () => {
  if (props.examResults.accuracy >= 90) return '保持当前学习节奏'
  if (props.examResults.accuracy >= 70) return '加强错题复习'
  return '建议系统复习基础知识'
}

const getTotalQuestions = () => {
  return props.questionGroups.flat().length
}

const getErrorCount = () => {
  return getTotalQuestions() - props.examResults.correctCount
}

const getErrorRate = () => {
  return Math.round((getErrorCount() / getTotalQuestions()) * 100)
}

const getErrorQuestions = () => {
  return props.questionGroups.flat().filter(question => 
    getUserAnswer(question.questionId) !== parseInt(question.answer) - 1
  )
}

const getErrorType = (question: any) => {
  if (question.hearingUrl) return '听力题'
  if (question.questionStemImage) return '阅读题'
  return '选择题'
}

// 播放讲解视频
const playExplanationVideo = (question: any) => {
  console.log('播放题目讲解视频:', question.questionId, question.explanationUrl)

  // 检查视频权限
  if (!hasVideoPermission.value) {
    showVideoPermissionDialog.value = true
    return
  }

  // 先停止当前正在播放的视频
  if (explanationVideo.value) {
    explanationVideo.value.pause()
    explanationVideo.value.currentTime = 0
  }

  // 确保每道题都有自己的讲解视频URL
  if (!question || !question.explanationUrl) {
    console.warn('该题目没有讲解视频URL:', question)
    explanationVideoUrl.value = null
    showVideoDialog.value = true
    return
  }
  
  // 使用题目特定的讲解视频URL
  const videoUrl = getVideoUrl(question.explanationUrl)
  console.log('解密后的视频URL:', videoUrl)
  
  if (videoUrl) {
    explanationVideoUrl.value = videoUrl
  } else {
    console.warn('视频URL解密失败:', question.explanationUrl)
    explanationVideoUrl.value = null
  }
  
  showVideoDialog.value = true
  
  // 确保视频元素重新加载新的视频源
  setTimeout(() => {
    if (explanationVideo.value && explanationVideoUrl.value) {
      explanationVideo.value.load()
    }
  }, 100)
}


// 停止讲解视频
const stopExplanationVideo = () => {
  if (explanationVideo.value) {
    explanationVideo.value.pause()
    explanationVideo.value.currentTime = 0
  }
}

const retryExam = () => {
  emit('retryExam')
}

// 组件卸载时停止所有视频
onUnmounted(() => {
  stopExplanationVideo()
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    stopExplanationVideo()
  }
})
</script>

<style lang="scss" scoped>
.exam-results {
  padding: var(--spacing-xl) 0;
}

.results-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-xxl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
    
    i {
      color: var(--accent-color);
    }
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-sm);
  }

  .result-message {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: var(--spacing-xl);
  }
}

.score-overview {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.main-score {
  position: relative;
  
  .score-value {
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .score-label {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .score-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    z-index: -1;
  }
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: rgba(255,255,255,0.2);
  stroke-width: 2;
}

.circle {
  fill: none;
  stroke: var(--accent-color);
  stroke-width: 2;
  stroke-linecap: round;
  animation: progress 2s ease-in-out;
}

.score-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.score-card {
  .score-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .score-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

.performance-analysis {
  background-color: rgba(255,255,255,0.1);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-md);
  }
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.analysis-item {
  text-align: center;
  
  .analysis-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 5px;
  }
  
  .analysis-value {
    font-weight: 500;
  }
}

.results-content {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--background-color);
  }
  
  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}

.questions-review {
  padding: var(--spacing-xl);
}

.question-group-review {
  margin-bottom: var(--spacing-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.group-stem-review {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  
  h4 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
  
  .group-stem-text {
    font-size: 1.1rem;
    line-height: 1.6;
  }
}

.question-review {
  background-color: var(--background-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .question-number {
      font-weight: 500;
      color: var(--primary-color);
    }

    .answer-status {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;

      &.correct {
        background-color: var(--success-color);
      }

      &.incorrect {
        background-color: var(--error-color);
      }
    }
  }

  .question-content {
    .question-text {
      font-size: 1.1rem;
      margin-bottom: var(--spacing-md);
      line-height: 1.6;
    }
  }

  .options-review {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin: var(--spacing-md) 0;

    .option-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 4px;
      font-size: 0.95rem;

      .option-label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--border-color);
        color: white;
        font-size: 0.8rem;
        font-weight: 500;
      }

      &.correct {
        background-color: rgba(46, 204, 113, 0.1);
        color: var(--success-color);
        
        .option-label {
          background-color: var(--success-color);
        }
      }

      &.incorrect {
        background-color: rgba(231, 76, 60, 0.1);
        color: var(--error-color);
        
        .option-label {
          background-color: var(--error-color);
        }
      }

      &.selected:not(.correct):not(.incorrect) {
        font-weight: 500;
        
        .option-label {
          background-color: var(--primary-color);
        }
      }
    }
  }
}

.explanation {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);

  .explanation-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }

  p {
    color: var(--text-light);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
  }
  
  .btn-video {
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
}

.error-analysis {
  padding: var(--spacing-xl);
}

.analysis-summary {
  margin-bottom: var(--spacing-xl);
  
  h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
  }
}

.error-stats {
  display: flex;
  gap: var(--spacing-xl);
  
  .stat-item {
    text-align: center;
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--error-color);
      margin-bottom: 5px;
    }
    
    .stat-label {
      color: var(--text-light);
    }
  }
}

.error-questions {
  h4 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
  }
}

.no-errors {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--success-color);
  
  i {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
  }
  
  p {
    font-size: 1.1rem;
  }
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.error-item {
  padding: var(--spacing-lg);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--error-color);
  
  .error-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
    
    .question-id {
      font-weight: 500;
      color: var(--primary-color);
    }
    
    .error-type {
      font-size: 0.9rem;
      color: var(--text-light);
    }
  }
  
  .error-question {
    margin-bottom: var(--spacing-sm);
    line-height: 1.6;
  }
  
  .error-details {
    display: flex;
    gap: var(--spacing-lg);
    font-size: 0.9rem;
    margin-bottom: var(--spacing-md);
    
    .your-answer {
      color: var(--error-color);
    }
    
    .correct-answer {
      color: var(--success-color);
    }
  }
  
  .btn-video {
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
}

.results-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: var(--border-radius);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;
    
    &.btn-primary {
      background-color: var(--primary-color);
      color: white;
      
      &:hover {
        background-color: var(--primary-dark);
      }
    }
    
    &.btn-secondary {
      background-color: white;
      color: var(--text-color);
      border: 1px solid var(--border-color);
      
      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
    
    &.btn-accent {
      background-color: var(--accent-color);
      color: white;
      
      &:hover {
        background-color: var(--accent-dark);
      }
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

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes progress {
  0% { stroke-dasharray: 0 100; }
}
.explanation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.btn-video-small {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .vip-badge {
    margin-left: 4px;
    font-size: 0.75rem;
  }
}

</style>