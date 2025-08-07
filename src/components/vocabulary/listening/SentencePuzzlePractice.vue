<template>
  <div class="sentence-puzzle-practice">
    <div v-if="!practiceStarted" class="practice-intro">
      <PracticeIntro 
        title="例句听力拼图练习"
        description="通过拼接例句片段，提高您的日语听力和语法能力"
        :level-options="levelOptions"
        :count-options="countOptions"
        :current-level="currentLevel"
        :word-count="wordCount"
        @level-change="currentLevel = $event"
        @count-change="wordCount = $event"
        @start-practice="startPractice"
      />
    </div>

    <div v-else-if="practiceStarted && !practiceCompleted" class="practice-content">
      <PracticeHeader 
        :current-index="currentIndex" 
        :total-count="words.length"
      />

      <div class="question-card" v-if="currentWord">
        <QuestionHeader 
          :level="currentWord.level"
          :level-class="getLevelClass(currentWord.level)"
        />
        
        <div class="question-content">
          <AudioSection 
            :is-playing="isPlaying"
            @play-audio="playExampleAudio"
          />
          
          <div class="puzzle-section" v-if="!showAnswer">
            <div class="puzzle-instruction">
              <p>请点击下方的片段，将它们放到正确的位置，拼成完整的例句：</p>
            </div>
            
            <div class="puzzle-workspace">
              <div class="puzzle-target">
                <div 
                  v-for="(slot, index) in puzzleSlots" 
                  :key="`slot-${index}`"
                  :class="['puzzle-slot', { 'selected': selectedSlotIndex === index }]"
                  @click="selectSlot(index)"
                >
                  <div 
                    v-if="slot !== null" 
                    class="puzzle-piece"
                  >
                    {{ puzzlePieces[slot] }}
                  </div>
                </div>
              </div>
              
              <div class="puzzle-pieces">
                <div 
                  v-for="(piece, index) in puzzlePieces" 
                  :key="`piece-${index}`"
                  v-show="!isPieceUsed(index)"
                  :class="['puzzle-piece', { 'selected': selectedPieceIndex === index }]"
                  @click="selectPiece(index)"
                >
                  {{ piece }}
                </div>
              </div>
            </div>
            
            <div class="puzzle-actions">
              <button class="btn-reset" @click="resetPuzzle">
                <i class="ri-refresh-line"></i>
                重置
              </button>
              <button class="btn-check" @click="checkAnswer" :disabled="!isPuzzleComplete()">
                <i class="ri-check-line"></i>
                检查答案
              </button>
            </div>
          </div>
          
          <div class="question-navigation">
            <button class="nav-btn prev" @click="prevQuestion" :disabled="isFirstQuestion">
              <i class="ri-arrow-left-line"></i>
              上一题
            </button>
            <button class="nav-btn next" @click="skipToNextQuestion" :class="{ 'transitioning': isTransitioning }" :disabled="isTransitioning && skipCountdown > 0">
            <i v-if="isTransitioning && skipCountdown > 0" class="ri-timer-line"></i>
            <i v-else-if="isTransitioning" class="ri-loader-4-line spinning"></i>
            <span v-if="skipCountdown > 0">{{ skipCountdown }}秒后可操作</span>
            <span v-else>{{ showAnswer ? '下一题' : (isLastQuestion ? '完成练习' : '跳过') }}</span>
            <i class="ri-arrow-right-line"></i>
          </button>
          </div>
          
          <AnswerFeedback 
            v-if="showAnswer"
            :match-score="matchScore"
            :user-answer="getUserAnswer()"
            :current-word="currentWord"
          />
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
          <div class="stat-value">{{ Math.round(totalScore / parseInt(wordCount)) }}%</div>
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
          <div class="stat-value">{{ words.length }}</div>
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
                    {{ result.isCorrect ? '正确' : (result.userAnswer === '跳过' ? '跳过' : '错误') }}
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
                  <div class="answer-comparison" v-if="result.userAnswer !== '跳过'">
                    <div class="answer-section">
                      <div class="answer-label">您的答案:</div>
                      <div class="answer-text">{{ result.userAnswer || '(未输入)' }}</div>
                    </div>
                    <div class="answer-section">
                      <div class="answer-label">正确答案:</div>
                      <div class="answer-text correct">{{ result.correctAnswer }}</div>
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
import PracticeIntro from './components/PracticeIntro.vue'
import PracticeHeader from './components/PracticeHeader.vue'
import QuestionHeader from './components/QuestionHeader.vue'
import AudioSection from './components/AudioSection.vue'
import AnswerFeedback from './components/AnswerFeedback.vue'
import QuestionFooter from './components/QuestionFooter.vue'
import PracticeResults from './components/PracticeResults.vue'
import { playWordAudio as playWordAudioUtil, playExampleAudio as playExampleAudioUtil, stopAllAudio } from '../../../utils/audio'

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
const matchScore = ref(0)
const totalScore = ref(0)
const perfectCount = ref(0)
const isLoading = ref(false)
const showAudioPermissionDialog = ref(false)
const isTransitioning = ref(false)
const practiceResults = ref<any[]>([])
const isAnyAudioPlaying = ref(false)

// 拼图状态
const puzzlePieces = ref<string[]>([])
const puzzleSlots = ref<(number | null)[]>([])
const selectedSlotIndex = ref<number | null>(null)
const selectedPieceIndex = ref<number | null>(null)

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
  // 重置练习结果
  usedExamples.value = new Set()
  practiceResults.value = []
  totalScore.value = 0
  perfectCount.value = 0
  
  currentIndex.value = 0
  showAnswer.value = false
  matchScore.value = 0
  practiceStarted.value = true
  practiceCompleted.value = false
  
  // 初始化第一题的拼图
  initPuzzle()
}

// 初始化拼图
const initPuzzle = () => {
  // 确保音频状态重置
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false

  if (!currentWord.value || !currentWord.value.example) return

  // 将例句分割成片段
  const sentence = currentWord.value.example

  // 更智能的分词逻辑：优先按标点分割，再按助词分割
  let segments = sentence.split(/([、。！？])/).filter(s => s !== '')
  let finalSegments: string[] = []
  for (const seg of segments) {
    if (/^[、。！？]$/.test(seg)) {
      finalSegments.push(seg)
    } else {
      // 按助词分割
      const subSegs = seg.split(/([はをにでとがもの])/).filter(s => s !== '')
      finalSegments.push(...subSegs)
    }
  }
  // 移除空字符串和纯空白
  finalSegments = finalSegments.filter(s => s.trim() !== '')

  // 如果分段太少，进行更细致的分割
  if (finalSegments.length < 3) {
    let tempSegments: string[] = []
    for (const segment of finalSegments) {
      if (segment.length > 3) {
        const midPoint = Math.floor(segment.length / 2)
        tempSegments.push(segment.substring(0, midPoint))
        tempSegments.push(segment.substring(midPoint))
      } else {
        tempSegments.push(segment)
      }
    }
    finalSegments = tempSegments
  }

  // 打乱顺序
  puzzlePieces.value = [...finalSegments].sort(() => Math.random() - 0.5)

  // 初始化插槽（全部为空）
  puzzleSlots.value = Array(finalSegments.length).fill(null)

  // 重置选择状态
  selectedSlotIndex.value = null
  selectedPieceIndex.value = null
}


// 选择槽位
const selectSlot = (index: number) => {
  // 如果槽位已经有内容，并且没有选中的片段，则选中这个槽位
  if (puzzleSlots.value[index] !== null && selectedPieceIndex.value === null) {
    selectedSlotIndex.value = index
    return
  }
  
  // 如果已经选中了片段，则将片段放入槽位
  if (selectedPieceIndex.value !== null) {
    // 如果槽位已经有内容，则交换
    if (puzzleSlots.value[index] !== null) {
      const temp = puzzleSlots.value[index]
      puzzleSlots.value[index] = selectedPieceIndex.value
      // 如果之前有选中的槽位，则将交换出来的片段放入之前选中的槽位
      if (selectedSlotIndex.value !== null) {
        puzzleSlots.value[selectedSlotIndex.value] = temp
      }
    } else {
      // 如果槽位为空，则直接放入
      puzzleSlots.value[index] = selectedPieceIndex.value
    }
    
    // 重置选择状态
    selectedPieceIndex.value = null
    selectedSlotIndex.value = null
  } else {
    // 如果没有选中片段，也没有选中槽位，则选中这个槽位
    selectedSlotIndex.value = index
  }
}

// 选择片段
const selectPiece = (index: number) => {
  // 如果片段已经被使用，则不做任何操作
  if (isPieceUsed(index)) return
  
  // 如果已经选中了槽位，则将片段放入槽位
  if (selectedSlotIndex.value !== null) {
    // 如果槽位已经有内容，则交换
    if (puzzleSlots.value[selectedSlotIndex.value] !== null) {
      const temp = puzzleSlots.value[selectedSlotIndex.value]
      puzzleSlots.value[selectedSlotIndex.value] = index
      // 重置选中的片段索引（因为已经放入槽位）
      selectedPieceIndex.value = null
    } else {
      // 如果槽位为空，则直接放入
      puzzleSlots.value[selectedSlotIndex.value] = index
    }
    
    // 重置选择状态
    selectedSlotIndex.value = null
  } else {
    // 如果没有选中槽位，则选中这个片段
    selectedPieceIndex.value = index
  }
}

// 检查片段是否已被使用
const isPieceUsed = (pieceIndex: number): boolean => {
  return puzzleSlots.value.includes(pieceIndex)
}

// 检查拼图是否完成
const isPuzzleComplete = (): boolean => {
  return !puzzleSlots.value.includes(null)
}

// 获取用户拼接的答案
const getUserAnswer = (): string => {
  return puzzleSlots.value
    .map(slotIndex => slotIndex !== null ? puzzlePieces.value[slotIndex] : '')
    .join('')
}

// 重置拼图
const resetPuzzle = () => {
  puzzleSlots.value = Array(puzzleSlots.value.length).fill(null)
  selectedSlotIndex.value = null
  selectedPieceIndex.value = null
}

// 检查答案
const checkAnswer = () => {
  if (!currentWord.value || !isPuzzleComplete()) return
  
  // 标记当前例句为已使用
  const exampleKey = `${currentWord.value.id}-${currentWord.value.example}`
  usedExamples.value.add(exampleKey)
  
  const userAnswer = getUserAnswer()
  const correctAnswer = currentWord.value.example
  
  // 计算匹配度
  const similarity = calculateSimilarity(userAnswer, correctAnswer)
  matchScore.value = similarity
  
  // 检查是否已经有该题目的结果记录，如果有则更新，否则添加新记录
  const existingResultIndex = practiceResults.value.findIndex(result => 
    result.word.id === currentWord.value.id && result.questionIndex === currentIndex.value
  )
  
  const resultData = {
    word: JSON.parse(JSON.stringify(currentWord.value)), // 完全深拷贝避免引用问题
    userAnswer: userAnswer,
    correctAnswer: correctAnswer,
    matchScore: matchScore.value,
    isCorrect: matchScore.value >= 90,
    questionType: '例句拼图',
    questionIndex: currentIndex.value // 添加题目索引
  }
  
  if (existingResultIndex !== -1) {
    // 更新已存在的记录
    const oldResult = practiceResults.value[existingResultIndex]
    practiceResults.value[existingResultIndex] = resultData
    
    // 调整分数（移除旧分数，添加新分数）
    totalScore.value = totalScore.value - oldResult.matchScore + matchScore.value
    if (oldResult.matchScore >= 90) {
      perfectCount.value--
    }
    if (matchScore.value >= 90) {
      perfectCount.value++
    }
  } else {
    // 添加新记录
    practiceResults.value.push(resultData)
    
    // 累计总分
    totalScore.value += matchScore.value
    
    // 如果匹配度高于90%，计为完全正确
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
    showAnswer.value = false
    
    // 返回上一题
    currentIndex.value--
    initPuzzle()
    isTransitioning.value = false
  }, 300)
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

// 播放例句音频
const playExampleAudio = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }

  // 如果有其他音频在播放，先停止
  if (isAnyAudioPlaying.value) {
    stopAllAudio()
    isPlaying.value = false
    isAnyAudioPlaying.value = false
  }

  if (!currentWord.value || !currentWord.value.example || !currentWord.value.wordAudioUrl || isPlaying.value) return

  // 立即停止所有其他音频并重置状态
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false

  playExampleAudioUtil(
    currentWord.value.wordAudioUrl,
    0, // 例句1 - 修正索引
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
    initPuzzle()
    
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
      userAnswer: '跳过',
      correctAnswer: currentWord.value.example,
      matchScore: 0,
      isCorrect: false,
      questionType: '例句拼图',
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
    setTimeout(() => {
      proceedToNextQuestion()
    }, 300)
  } else {
    // 如果已经显示答案，直接进入下一题
    setTimeout(() => {
      proceedToNextQuestion()
    }, 300)
  }
}

// 新增方法：进入下一题
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
    showAnswer.value = false
    initPuzzle() // 重新初始化拼图

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
  // 停止所有音频播放并重置状态
  stopAllAudio()
  isPlaying.value = false
  isAnyAudioPlaying.value = false
  // 重置练习状态但保持练习开始状态
  usedExamples.value = new Set()
  practiceStarted.value = false
  practiceCompleted.value = false
  
  // 重新开始练习流程
  setTimeout(() => {
    startPractice()
  }, 100)
}

// 返回选择页面
const backToSelection = () => {
  practiceStarted.value = false
  practiceCompleted.value = false
  currentIndex.value = 0
  words.value = []
  practiceResults.value = []
  totalScore.value = 0
  perfectCount.value = 0
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
  return practiceResults.value.filter(result => result.userAnswer === '跳过').length
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
.sentence-puzzle-practice {
  width: 100%;
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

.question-content {
  padding: var(--spacing-xl);
}

.puzzle-section {
  margin-bottom: var(--spacing-xl);
}

.puzzle-instruction {
  margin-bottom: var(--spacing-md);
  
  p {
    color: var(--text-light);
  }
}

.puzzle-workspace {
  margin-bottom: var(--spacing-lg);
}

.puzzle-target {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  min-height: 100px;
}

.puzzle-slot {
  min-width: 80px;
  height: 40px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  
  &.selected {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.1);
  }
  
  .puzzle-piece {
    margin: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.puzzle-pieces {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.puzzle-piece {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
  
  &.selected {
    background-color: var(--primary-dark);
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }
}

.puzzle-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.btn-reset,
.btn-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-reset {
  background-color: var(--background-color);
  color: var(--text-color);
  
  &:hover {
    background-color: var(--border-color);
  }
}

.btn-check {
  background-color: var(--primary-color);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
  max-height: 300px;
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
    margin-bottom: var(--spacing-sm);
    
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
.btn-back {
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

.btn-back {
  background-color: var(--background-color);
  color: var(--text-color);
  
  &:hover {
    background-color: var(--border-color);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>