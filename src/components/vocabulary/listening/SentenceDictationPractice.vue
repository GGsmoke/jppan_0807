<template>
  <div class="sentence-dictation-practice">
    <div v-if="!practiceStarted" class="practice-intro">
      <div class="practice-header">
        <div class="header-content">
          <div class="header-title">
            <h2>例句听力默写练习</h2>
            <p>通过听力默写例句，提高您的日语听力和写作能力</p>
          </div>
          
          <div class="level-filters">
            <button 
              v-for="level in levelOptions" 
              :key="level"
              :class="['level-btn', { active: currentLevel === level }]"
              @click="currentLevel = level"
            >
              {{ level }}
            </button>
          </div>
          
          <div class="count-selector">
            <label>例句数量</label>
            <select v-model="wordCount">
              <option v-for="option in countOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <button class="btn-start-practice" @click="startPractice">
            开始练习
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="practiceStarted && !practiceCompleted" class="practice-content">
      <div class="practice-header">
        <div class="progress-info">
          <span class="progress-text">{{ currentIndex + 1 }} / {{ words.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(currentIndex + 1) / words.length * 100}%` }"></div>
          </div>
        </div>
      </div>

      <div class="question-card" v-if="currentWord">
        <div class="question-header">
          <div :class="['level-badge', getLevelClass(currentWord.level)]">{{ currentWord.level }}</div>
        </div>
        
        <div class="question-content">
          <div class="audio-section">
            <button class="play-btn" @click="playExampleAudio" :disabled="isPlaying">
              <i :class="isPlaying || isAnyAudioPlaying ? 'ri-loader-4-line spinning' : 'ri-volume-up-line'"></i>
              {{ isPlaying ? '播放中...' : '播放例句' }}
            </button>
          </div>
          
          <div class="input-section" v-if="!showAnswer">
            <div class="form-group">
              <label>请输入您听到的日文例句：</label>
              <textarea 
                v-model="userJapaneseInput" 
                rows="3" 
                placeholder="请在此输入日文例句..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>请输入对应的中文翻译：</label>
              <textarea 
                v-model="userChineseInput" 
                rows="3" 
                placeholder="请在此输入中文翻译..."
              ></textarea>
            </div>
            
            <button class="btn-submit" @click="submitAnswer" :disabled="!canSubmit">
              提交答案
            </button>
          </div>
          
          <div v-if="showAnswer" class="answer-feedback">
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
                <h4>您的输入：</h4>
                <p class="jp-text">{{ userJapaneseInput || '(未输入)' }}</p>
                <p class="cn-text">{{ userChineseInput || '(未输入)' }}</p>
              </div>
              
              <div class="comparison-item correct">
                <h4>正确答案：</h4>
                <p class="jp-text">{{ currentWord.example }}</p>
                <p class="cn-text">{{ currentWord.exampleMeaning }}</p>
                <button class="play-example-btn" @click="playExampleAudio">
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
        </div>
        
        <div class="question-navigation">
          <button class="nav-btn prev" @click="prevQuestion" :disabled="isFirstQuestion">
            <i class="ri-arrow-left-line"></i>
            上一题
          </button>
          <button class="nav-btn next" @click="skipToNextQuestion" :class="{ 'transitioning': isTransitioning }" :disabled="skipCountdown > 0">
            <i v-if="isTransitioning && skipCountdown > 0" class="ri-timer-line"></i>
            <i v-else-if="isTransitioning" class="ri-loader-4-line spinning"></i>
            <span v-if="skipCountdown > 0">{{ skipCountdown }}秒后可操作</span>
            <span v-else>{{ showAnswer ? '下一题' : (isLastQuestion ? '完成练习' : '跳过') }}</span>
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      
      </div>
    </div>

    <div v-else-if="practiceCompleted" class="practice-results">
      <div class="results-header">
        <div class="result-icon">
          <i :class="getResultIcon()"></i>
        </div>
        <h2>练习完成！</h2>
        <p>{{ getResultMessage() }}</p>
      </div>
      
      <div class="results-stats">
        <div class="stat-item">
          <div class="stat-value">{{ Math.round(totalScore / words.length) }}%</div>
          <div class="stat-label">平均匹配度</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ perfectCount }}</div>
          <div class="stat-label">完全正确</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ getSkippedCount() }}</div>
          <div class="stat-label">跳过题数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ practiceResults.length }}</div>
          <div class="stat-label">总题数</div>
        </div>
      </div>
      
      <div class="results-analysis">
        <h3>详细分析</h3>
        <div class="analysis-content">
          <div class="analysis-grid">
            <div class="analysis-item">
              <div class="analysis-label">完全正确</div>
              <div class="analysis-value">{{ perfectCount }}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">跳过题数</div>
              <div class="analysis-value">{{ getSkippedCount() }}</div>
            </div>
            <div class="analysis-item">
              <div class="analysis-label">表现评价</div>
              <div class="analysis-value">{{ getPerformanceLevel() }}</div>
            </div>
          </div>
          <p>建议：{{ getRecommendation() }}</p>
          
          <div class="detailed-results">
            <h4>答题详情</h4>
            <div class="results-list">
              <div 
                v-for="(result, index) in practiceResults" 
                :key="index"
                :class="['result-item', { 'correct': result.isCorrect, 'incorrect': !result.isCorrect }]"
              >
                <div class="result-header">
                  <span class="question-number">第{{ index + 1 }}题</span>
                  <span class="result-status">
                    <i :class="result.isCorrect ? 'ri-check-line' : 'ri-close-line'"></i>
                    {{ result.isCorrect ? '正确' : (result.userJapaneseAnswer === '跳过' ? '跳过' : '错误') }}
                  </span>
                  <span class="match-score">匹配度: {{ result.matchScore }}%</span>
                </div>
                <div class="result-content">
                  <div class="word-info">
                    <span class="kanji">{{ result.word.kanji }}</span>
                    <span class="kana">{{ result.word.kana }}</span>
                    <span class="meaning">{{ result.word.meaning }}</span>
                  </div>
                  <div class="example-info" v-if="result.word.example">
                    <div class="example-section">
                      <div class="example-label">例句:</div>
                      <div class="example-text jp-text">{{ result.word.example }}</div>
                    </div>
                    <div class="example-section" v-if="result.word.exampleMeaning">
                      <div class="example-label">翻译:</div>
                      <div class="example-text cn-text">{{ result.word.exampleMeaning }}</div>
                    </div>
                  </div>
                  <div class="answer-comparison" v-if="result.userJapaneseAnswer !== '跳过'">
                    <div class="answer-section">
                      <div class="answer-label">您的日文答案:</div>
                      <div class="answer-text">{{ result.userJapaneseAnswer || '(未输入)' }}</div>
                    </div>
                    <div class="answer-section">
                      <div class="answer-label">正确日文答案:</div>
                      <div class="answer-text correct">{{ result.correctJapanese }}</div>
                    </div>
                    <div class="answer-section">
                      <div class="answer-label">您的中文答案:</div>
                      <div class="answer-text">{{ result.userChineseAnswer || '(未输入)' }}</div>
                    </div>
                    <div class="answer-section">
                      <div class="answer-label">正确中文答案:</div>
                      <div class="answer-text correct">{{ result.correctChinese }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="results-actions">
        <button class="btn-retry" @click="restartPractice">
          <i class="ri-restart-line"></i>
          重新练习
        </button>
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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VOCABULARY_API, DEFAULT_PARAMS } from '../../../config/api-vocabulary'
import { LEVEL_OPTIONS, COUNT_OPTIONS, RESULT_FEEDBACK } from '../../../config/vocabulary-listening-config'
import { playExampleAudio as playExampleAudioUtil, stopAllAudio } from '../../../utils/audio'

const emit = defineEmits(['show-contact'])
const authStore = useAuthStore()

// 练习状态
const practiceStarted = ref(false)
const practiceCompleted = ref(false)
const currentLevel = ref('全部')
const wordCount = ref('12')
const words = ref<any[]>([])
const usedExamples = ref<Set<string>>(new Set())
const currentIndex = ref(0)
const showAnswer = ref(false)
const isPlaying = ref(false)
const isAnyAudioPlaying = ref(false)
const userJapaneseInput = ref('')
const userChineseInput = ref('')
const matchScore = ref(0)
const totalScore = ref(0)
const perfectCount = ref(0)
const isLoading = ref(false)
const showAudioPermissionDialog = ref(false)
const isTransitioning = ref(false)
const practiceResults = ref<any[]>([])
// 跳过倒计时相关状态
const skipCountdown = ref(0)
const skipTimer = ref<NodeJS.Timeout | null>(null)

// 配置选项
const levelOptions = LEVEL_OPTIONS
const countOptions = COUNT_OPTIONS

// 计算属性
const currentWord = computed(() => words.value[currentIndex.value] || null)
const isLastQuestion = computed(() => currentIndex.value === words.value.length - 1)
const isFirstQuestion = computed(() => currentIndex.value === 0)

// 是否可以提交答案
const canSubmit = computed(() => {
  return userJapaneseInput.value.trim() !== '' || userChineseInput.value.trim() !== ''
})

// 开始练习
const startPractice = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  isLoading.value = true
  
  try {
    // 构建API请求参数
    const params = {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      loginType: DEFAULT_PARAMS.loginType,
      useType: DEFAULT_PARAMS.useType,
      userTypeUseWordId: 0, // 默认词库ID
      jpltLevel: currentLevel.value === '全部' ? 'N' : currentLevel.value,
      wordCount: parseInt(wordCount.value)
    }

    // 发送API请求
    const response = await axios.post(VOCABULARY_API.WORD_CARDS, params)

    if (response.data.code === 200) {
      // 处理API返回的数据
      const apiWords = response.data.data.map((word: any) => ({
        id: word.wordId,
        kanji: word.wordKanji,
        kana: word.wordKana,
        meaning: word.wordMeaning,
        level: word.jlptLevel,
        tags: word.tags ? word.tags.split(',') : [],
        example: word.wordExampleSentence1,
        exampleMeaning: word.wordExampleTranslation1,
        example2: word.wordExampleSentence2,
        exampleMeaning2: word.wordExampleTranslation2,
        example3: word.wordExampleSentence3,
        exampleMeaning3: word.wordExampleTranslation3,
        wordAudioUrl: word.wordAudioUrl
      }))
      
      // 过滤掉没有例句的单词
      words.value = apiWords.filter((word: any) => word.example && word.exampleMeaning)
      
      if (words.value.length === 0) {
        ElMessage.warning('当前题正在补充，请期待')
        return
      }
      
      // 初始化练习
      initPractice()
    } else {
      throw new Error(response.data.msg || '获取单词失败')
    }
  } catch (err) {
    console.error('API请求失败，使用本地数据', err)
    
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      ElMessage.warning('当前题正在补充，请期待')
    } else {
      ElMessage.error(err instanceof Error ? err.message : '获取单词失败，请稍后重试')
      await fetchLocalWords()
    }
  } finally {
    isLoading.value = false
  }
}

// 从本地JSON文件获取单词（作为备份）
const fetchLocalWords = async () => {
  try {
    const response = await fetch('/db.json')
    const data = await response.json()
    
    let filteredWords = data.vocabulary
    
    if (currentLevel.value !== '全部') {
      filteredWords = filteredWords.filter((word: any) => word.level === currentLevel.value)
    }
    
    // 过滤掉没有例句的单词
    filteredWords = filteredWords.filter((word: any) => word.example && word.exampleMeaning)
    
    // 限制单词数量
    words.value = filteredWords.slice(0, parseInt(wordCount.value)).map((word: any) => ({
      ...word,
      wordAudioUrl: word.wordAudioUrl || ''
    }))
    
    if (words.value.length > 0) {
      initPractice()
    } else {
      ElMessage.warning('没有找到符合条件的例句')
    }
  } catch (err) {
    ElMessage.error('获取单词失败，请稍后重试')
  }
}

// 初始化练习
const initPractice = () => {
  usedExamples.value = new Set()
  currentIndex.value = 0
  showAnswer.value = false
  userJapaneseInput.value = ''
  userChineseInput.value = ''
  matchScore.value = 0
  totalScore.value = 0
  perfectCount.value = 0
  practiceStarted.value = true
  practiceCompleted.value = false
}

// 播放例句音频
const playExampleAudio = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  if (!currentWord.value || !currentWord.value.example || !currentWord.value.wordAudioUrl || isPlaying.value) return
  
  // 立即停止所有其他音频并重置状态
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  
  playExampleAudioUtil(
    currentWord.value.wordAudioUrl,
    0, // 例句1
    () => { 
      isPlaying.value = true
      isAnyAudioPlaying.value = true
    },
    () => { 
      isPlaying.value = false
      isAnyAudioPlaying.value = false
    },
    () => { 
      isPlaying.value = false
      isAnyAudioPlaying.value = false
    }
  )
}

// 计算文本相似度（简单版）
const calculateSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2) return 0
  
  // 移除空格和标点
  const cleanText1 = text1.replace(/[\s.,?!;:'"()]/g, '').toLowerCase()
  const cleanText2 = text2.replace(/[\s.,?!;:'"()]/g, '').toLowerCase()
  
  // 计算最长公共子序列
  const m = cleanText1.length
  const n = cleanText2.length
  
  // 如果任一字符串为空，相似度为0
  if (m === 0 || n === 0) return 0
  
  // 计算编辑距离
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (cleanText1[i - 1] === cleanText2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // 替换
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j] + 1      // 删除
        )
      }
    }
  }
  
  // 计算相似度百分比
  const maxLength = Math.max(m, n)
  const editDistance = dp[m][n]
  const similarity = Math.max(0, Math.round((1 - editDistance / maxLength) * 100))
  
  return similarity
}

// 提交答案
const submitAnswer = () => {
  if (!currentWord.value) return
  
  // 标记当前例句为已使用
  const exampleKey = `${currentWord.value.id}-${currentWord.value.example}`
  usedExamples.value.add(exampleKey)
  
  // 计算日文匹配度
  const jpSimilarity = calculateSimilarity(userJapaneseInput.value, currentWord.value.example)
  
  // 计算中文匹配度
  const cnSimilarity = calculateSimilarity(userChineseInput.value, currentWord.value.exampleMeaning)
  
  // 综合匹配度（日文占70%，中文占30%）
  matchScore.value = Math.round(jpSimilarity * 0.7 + cnSimilarity * 0.3)
  
  // 累计总分
  totalScore.value += matchScore.value
  
  // 如果匹配度高于90%，计为完全正确
  if (matchScore.value >= 90) {
    perfectCount.value++
  }
  
  // 检查是否已经有该题目的结果记录，如果有则更新，否则添加新记录
  const existingResultIndex = practiceResults.value.findIndex(result => 
    result.word.id === currentWord.value.id && result.questionIndex === currentIndex.value
  )
  
  const resultData = {
    word: JSON.parse(JSON.stringify(currentWord.value)), // 完全深拷贝避免引用问题
    userJapaneseAnswer: userJapaneseInput.value,
    userChineseAnswer: userChineseInput.value,
    correctJapanese: currentWord.value.example,
    correctChinese: currentWord.value.exampleMeaning,
    matchScore: matchScore.value,
    isCorrect: matchScore.value >= 90,
    questionType: '例句默写',
    questionIndex: currentIndex.value // 添加题目索引
  }
  
  if (existingResultIndex !== -1) {
    // 更新已存在的记录
    const oldResult = practiceResults.value[existingResultIndex]
    practiceResults.value[existingResultIndex] = resultData
    
    // 调整分数（移除旧分数，添加新分数）
    totalScore.value -= oldResult.matchScore
    if (oldResult.matchScore >= 90) {
      perfectCount.value--
    }
    
    totalScore.value += matchScore.value
    if (matchScore.value >= 90) {
      perfectCount.value++
    }
  } else {
    // 添加新记录
    practiceResults.value.push(resultData)
    
    totalScore.value += matchScore.value
    if (matchScore.value >= 90) {
      perfectCount.value++
    }
  }
  
  showAnswer.value = true
}

// 上一题
const prevQuestion = async () => {
  if (isFirstQuestion.value) return
  
  // 停止所有音频播放并重置状态
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  
  // 添加过渡动画
  isTransitioning.value = true
  
  setTimeout(() => {
    // 移除当前题目的练习结果记录
    if (practiceResults.value.length > 0) {
      const lastResult = practiceResults.value[practiceResults.value.length - 1]
      if (lastResult.questionIndex === currentIndex.value) {
        practiceResults.value.pop()
        // 调整分数
        totalScore.value -= lastResult.matchScore
        if (lastResult.matchScore >= 90) {
          perfectCount.value--
        }
      }
    }
    
    // 重置当前题目状态
    userJapaneseInput.value = ''
    userChineseInput.value = ''
    showAnswer.value = false
    
    // 返回上一题
    currentIndex.value--
    isTransitioning.value = false
  }, 300)
}

// 下一题
const nextQuestion = () => {
  // 停止所有音频播放并重置状态
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  
  if (isLastQuestion.value) {
    completePractice()
  } else {
    // 寻找下一个未使用的例句
    let nextIndex = currentIndex.value + 1
    while (nextIndex < words.value.length) {
      const word = words.value[nextIndex]
      const exampleKey = `${word.id}-${word.example}`
      if (!usedExamples.value.has(exampleKey)) {
        break
      }
      nextIndex++
    }
    
    currentIndex.value = nextIndex
    showAnswer.value = false
    userJapaneseInput.value = ''
    userChineseInput.value = ''
    
    if (currentIndex.value >= words.value.length) {
      completePractice()
    }
  }
}

// 跳过到下一题
const skipToNextQuestion = () => {
  // 立即停止所有音频播放并重置状态
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  if (!showAnswer.value) {
    // 记录跳过的题目
    const exampleKey = `${currentWord.value.id}-${currentWord.value.example}`
    usedExamples.value.add(exampleKey)
    
    // 检查是否已经有该题目的结果记录，如果有则更新，否则添加新记录
    const existingResultIndex = practiceResults.value.findIndex(result => 
      result.word.id === currentWord.value.id && result.questionIndex === currentIndex.value
    )
    
    const resultData = {
      word: JSON.parse(JSON.stringify(currentWord.value)), // 完全深拷贝避免引用问题
      userJapaneseAnswer: '跳过',
      userChineseAnswer: '跳过',
      correctJapanese: currentWord.value.example,
      correctChinese: currentWord.value.exampleMeaning,
      matchScore: 0,
      isCorrect: false,
      questionType: '例句默写',
      questionIndex: currentIndex.value // 添加题目索引
    }
    
    if (existingResultIndex !== -1) {
      // 更新已存在的记录
      const oldResult = practiceResults.value[existingResultIndex]
      practiceResults.value[existingResultIndex] = resultData
      
      // 调整分数（移除旧分数）
      totalScore.value -= oldResult.matchScore
      if (oldResult.matchScore >= 90) {
        perfectCount.value--
      }
    } else {
      // 添加新记录
      practiceResults.value.push(resultData)
    }
    
    if (isLastQuestion.value) {
      // 最后一题直接完成
      completePractice()
      return
    }
    // 立即进入下一题，不等待倒计时
    proceedToNextQuestion()
  } else {
    // 如果已经显示答案，直接进入下一题
    proceedToNextQuestion()
  }
}

// 进入下一题
const proceedToNextQuestion = () => {
  // 确保音频状态完全重置
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  
  if (isLastQuestion.value) {
    completePractice()
  } else {
    // 寻找下一个未使用的例句
    let nextIndex = currentIndex.value + 1
    while (nextIndex < words.value.length) {
      const word = words.value[nextIndex]
      const exampleKey = `${word.id}-${word.example}`
      if (!usedExamples.value.has(exampleKey)) {
        break
      }
      nextIndex++
    }
    
    currentIndex.value = nextIndex
    userJapaneseInput.value = ''
    userChineseInput.value = ''
    showAnswer.value = false
    
    if (currentIndex.value >= words.value.length) {
      completePractice()
    }
  }
  isTransitioning.value = false
  skipCountdown.value = 0
}

// 完成练习
const completePractice = () => {
  practiceCompleted.value = true
}

// 重新开始练习
const restartPractice = () => {
  // 停止所有音频播放
  stopAllAudio()
  
  // 重置所有状态
  usedExamples.value = new Set()
  practiceResults.value = []
  totalScore.value = 0
  perfectCount.value = 0
  currentIndex.value = 0
  showAnswer.value = false
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  userJapaneseInput.value = ''
  userChineseInput.value = ''
  matchScore.value = 0
  isTransitioning.value = false
  
  startPractice()
}

// 获取等级样式类
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

// 获取结果图标
const getResultIcon = () => {
  const avgScore = totalScore.value / parseInt(wordCount.value)
  if (avgScore >= 90) return 'ri-trophy-line'
  if (avgScore >= 70) return 'ri-medal-line'
  if (avgScore >= 50) return 'ri-award-line'
  return 'ri-emotion-normal-line'
}

// 获取结果消息
const getResultMessage = () => {
  const avgScore = totalScore.value / parseInt(wordCount.value)
  if (avgScore >= 90) return RESULT_FEEDBACK.excellent.title
  if (avgScore >= 70) return RESULT_FEEDBACK.good.title
  if (avgScore >= 50) return RESULT_FEEDBACK.average.title
  return RESULT_FEEDBACK.poor.title
}

// 获取表现级别
const getPerformanceLevel = () => {
  const avgScore = totalScore.value / parseInt(wordCount.value)
  if (avgScore >= 90) return '非常出色'
  if (avgScore >= 70) return '良好'
  if (avgScore >= 50) return '一般'
  return '有待提高'
}

// 获取建议
const getRecommendation = () => {
  const avgScore = totalScore.value / parseInt(wordCount.value)
  if (avgScore >= 90) return RESULT_FEEDBACK.excellent.message
  if (avgScore >= 70) return RESULT_FEEDBACK.good.message
  if (avgScore >= 50) return RESULT_FEEDBACK.average.message
  return RESULT_FEEDBACK.poor.message
}

// 获取跳过题数
const getSkippedCount = () => {
  return practiceResults.value.filter(result => result.userJapaneseAnswer === '跳过').length
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
  // 清理定时器
  if (skipTimer.value) {
    clearInterval(skipTimer.value)
    skipTimer.value = null
  }
})
</script>

<style lang="scss" scoped>
.sentence-dictation-practice {
  width: 100%;
}

.practice-intro {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

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
  
  .progress-info {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    
    .progress-text {
      text-align: center;
      margin-bottom: var(--spacing-xs);
    }
    
    .progress-bar {
      height: 8px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background-color: white;
        transition: width 0.3s ease;
      }
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

.practice-content {
  margin-top: var(--spacing-xl);
}

.question-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  max-width: 800px;
  margin: 0 auto;
}

.question-header {
  padding: var(--spacing-md);
  background-color: var(--background-color);
  display: flex;
  justify-content: flex-end;
}

.level-badge {
  display: inline-block;
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

.question-content {
  padding: var(--spacing-xl);
}

.audio-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.play-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  i {
    font-size: 1.2rem;
    
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }
}

.input-section {
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-md);
  
  label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
  }
  
  textarea {
    width: 100%;
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 1rem;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.btn-submit {
  display: block;
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

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

.question-footer {
  padding: var(--spacing-lg);
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.btn-next {
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
    box-shadow: var(--shadow-md);
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

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.analysis-item {
  text-align: center;
  background-color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  
  .analysis-label {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: var(--spacing-xs);
  }
  
  .analysis-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--primary-color);
  }
}

.detailed-results {
  margin-top: var(--spacing-lg);
  
  h4 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  background-color: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  border-left: 4px solid transparent;
  
  &.correct {
    border-left-color: var(--success-color);
  }
  
  &.incorrect {
    border-left-color: var(--error-color);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  .question-number {
    font-weight: 500;
  }
  
  .result-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
  }
  
  .match-score {
    font-size: 0.9rem;
    color: var(--primary-color);
    font-weight: 500;
  }
}

.result-content {
  .word-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    
    .kanji {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--primary-color);
    }
    
    .kana {
      color: var(--text-light);
    }
    
    .meaning {
      color: var(--text-color);
    }
  }
  
  .example-info {
    margin: var(--spacing-sm) 0;
    padding: var(--spacing-sm);
    background-color: var(--background-color);
    border-radius: 4px;
    border-left: 3px solid var(--primary-color);
  }
  
  .example-section {
    margin-bottom: var(--spacing-xs);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .example-label {
      font-size: 0.8rem;
      color: var(--text-light);
      margin-bottom: 2px;
      font-weight: 500;
    }
    
    .example-text {
      font-size: 0.9rem;
      line-height: 1.4;
      
      &.jp-text {
        color: var(--text-color);
        font-weight: 500;
      }
      
      &.cn-text {
        color: var(--text-light);
      }
    }
  }
}

.answer-comparison {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.answer-section {
  .answer-label {
    font-size: 0.8rem;
    color: var(--text-light);
    margin-bottom: 2px;
  }
  
  .answer-text {
    font-size: 0.9rem;
    padding: 4px 8px;
    background-color: var(--background-color);
    border-radius: 4px;
    
    &.correct {
      background-color: rgba(46, 204, 113, 0.1);
      color: var(--success-color);
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>