<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { FEATURE_FLAGS } from '../config/features'
import { stopAllAudio } from '../utils/audio'

// 导入配置
import { 
  VOCABULARY_API,
  WORD_LEVELS, 
  WORD_COUNT_OPTIONS,
  VOCABULARY_TABS,
  DEFAULT_PARAMS
} from '../config/api-vocabulary'

// 导入组件
import ModeSelector from '../components/vocabulary/ModeSelector.vue'
import LevelSelector from '../components/vocabulary/LevelSelector.vue'
import CountSelector from '../components/vocabulary/CountSelector.vue'
import VocabularyListMode from '../components/vocabulary/VocabularyListMode.vue'
import VocabularyStudyMode from '../components/vocabulary/VocabularyStudyMode.vue'
import VocabularyTestMode from '../components/vocabulary/VocabularyTestMode.vue'
import VocabularyListeningMode from '../components/vocabulary/VocabularyListeningMode.vue'
import WordDetails from '../components/vocabulary/WordDetails.vue'
import VideoDialog from '../components/vocabulary/VideoDialog.vue'
import WordCard from '../components/vocabulary/WordCard.vue'

const router = useRouter()
const authStore = useAuthStore()

// 页面状态
const currentTab = ref('list')
const currentLevel = ref('全部')
const wordCount = ref('12')
const words = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const displayMode = ref('list') // 默认为列表模式，而不是卡片模式
const globalLoading = ref(false)

// 卡片模式的当前索引
const currentCardIndex = ref(0)

// 测试模式状态
const testStarted = ref(false)
const testCompleted = ref(false)
const testLevel = ref('全部')
const testCount = ref('10')
const testType = ref('meaning')
const testWords = ref<any[]>([])
const testResults = ref<any>({
  score: 0,
  correct: 0,
  total: 0,
  time: 0,
  questions: []
})

// 单词详情状态
const showWordDetailDialog = ref(false)
const selectedWord = ref<any>(null)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 从API获取单词
const fetchWords = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }

  loading.value = true
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  error.value = ''

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
      words.value = response.data.data.map((word: any) => ({
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
        wordAudioUrl: word.wordAudioUrl,
        wordSpeakVideoUrl: word.wordSpeakVideoUrl
      }))
    } else {
      // 如果API返回错误，使用本地数据作为备份
      await fetchLocalWords()
    }
  } catch (err) {
    console.error('API请求失败，使用本地数据', err)
    await fetchLocalWords()
  } finally {
    loading.value = false
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
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
    
    // 限制单词数量
    words.value = filteredWords.slice(0, parseInt(wordCount.value))
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取单词失败，请稍后重试'
    ElMessage.error(error.value)
  }
}

// 切换标签
const switchTab = (tabId: string) => {
  // 停止所有音频和视频播放
  stopAllAudio()
  
  currentTab.value = tabId
  
  if (tabId === 'test') {
    testStarted.value = false
    testCompleted.value = false
  }
}

// 切换显示模式
const toggleDisplayMode = () => {
  displayMode.value = displayMode.value === 'card' ? 'list' : 'card'
}

// 设置等级
const setLevel = (level: string) => {
  currentLevel.value = level
  currentCardIndex.value = 0 // 重置卡片索引
  fetchWords()
}

// 更改单词数量
const changeWordCount = (count: string) => {
  wordCount.value = count
  currentCardIndex.value = 0 // 重置卡片索引
  fetchWords()
}

// 显示单词详情
const showWordDetails = (word: any) => {
  selectedWord.value = word
  showWordDetailDialog.value = true
}

// 加载更多单词
const loadMoreWords = () => {
  currentCardIndex.value = 0 // 重置卡片索引
  fetchWords()
}

// 开始测试
const startTest = async () => {
  // 停止所有音频和视频播放
  stopAllAudio()
  
  loading.value = true
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  
  try {
    // 构建API请求参数
    const params = {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      loginType: DEFAULT_PARAMS.loginType,
      useType: DEFAULT_PARAMS.useType,
      userTypeUseWordId: 0, // 默认词库ID
      jpltLevel: testLevel.value === '全部' ? 'N' : testLevel.value,
      wordCount: parseInt(testCount.value)
    }

    // 发送API请求
    const response = await axios.post(VOCABULARY_API.WORD_CARDS, params)

    if (response.data.code === 200) {
      // 处理API返回的数据
      testWords.value = response.data.data.map((word: any) => ({
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
        wordAudioUrl: word.wordAudioUrl,
        wordSpeakVideoUrl: word.wordSpeakVideoUrl
      }))
    } else {
      // 如果API返回错误，使用本地数据作为备份
      await fetchLocalTestWords()
    }
    
    testStarted.value = true
  } catch (err) {
    console.error('API请求失败，使用本地数据', err)
    await fetchLocalTestWords()
    testStarted.value = true
  } finally {
    loading.value = false
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

// 从本地JSON文件获取测试单词（作为备份）
const fetchLocalTestWords = async () => {
  try {
    const response = await fetch('/db.json')
    const data = await response.json()
    
    let filteredWords = data.vocabulary
    
    if (testLevel.value !== '全部') {
      filteredWords = filteredWords.filter((word: any) => word.level === testLevel.value)
    }
    
    // 随机选择指定数量的单词
    filteredWords = filteredWords.sort(() => Math.random() - 0.5).slice(0, parseInt(testCount.value))
    
    testWords.value = filteredWords
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取单词失败，请稍后重试'
    ElMessage.error(error.value)
  }
}

// 处理测试完成
const handleTestComplete = (results: any) => {
  testResults.value = results
  testCompleted.value = true
}

// 重新测试
const retryTest = () => {
  testCompleted.value = false
  startTest()
}

// 返回测试设置
const backToSetup = () => {
  testStarted.value = false
  testCompleted.value = false
}

// 播放讲解视频
const playExplanationVideo = (item: any) => {
  // 先停止当前正在播放的视频（如果VideoDialog组件有暴露的方法）
  if (showVideoDialog.value) {
    showVideoDialog.value = false
    // 等待对话框关闭后再打开新的
    setTimeout(() => {
      if (item && item.explanationUrl) {
        explanationVideoUrl.value = item.explanationUrl
      } else {
        explanationVideoUrl.value = null
      }
      showVideoDialog.value = true
    }, 100)
  } else {
    if (item && item.explanationUrl) {
      explanationVideoUrl.value = item.explanationUrl
    } else {
      explanationVideoUrl.value = null
    }
    showVideoDialog.value = true
  }
}

// 页面加载时获取单词
onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  
  fetchWords()
  
  // 添加页面离开事件监听器
  window.addEventListener('beforeunload', stopAllAudio)
})

// 页面卸载时停止所有音频和视频
onUnmounted(() => {
  stopAllAudio()
  window.removeEventListener('beforeunload', stopAllAudio)
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    // 视频对话框关闭时的处理
  }
})
</script>

<template>
  <div class="vocabulary-page">
    <div class="page-header">
      <div class="container">
        <h1>单词学习</h1>
        <p>两万个词汇 六万个例句 量大的词库背起来才过瘾</p>
      </div>
    </div>

    <div class="container">
      <!-- 模式选择器 -->
      <ModeSelector 
        :current-tab="currentTab" 
        :tabs="[
          { id: 'list', name: '单词列表', icon: 'ri-list-check' },
          { id: 'study', name: '学习时刻', icon: 'ri-book-read-line' },
          { id: 'test', name: '单词记忆练习', icon: 'ri-question-answer-line' },
          { id: 'listening', name: '听力练习', icon: 'ri-volume-up-line' }
        ]"
        @switch-tab="switchTab"
      />

      <div class="tab-content">
        <!-- 单词列表模式 -->
        <div v-if="currentTab === 'list'" class="mode-container">
          <div class="mode-header">
            <div class="left-controls">
              <LevelSelector 
                :current-level="currentLevel" 
                :levels="WORD_LEVELS"
                @change-level="setLevel"
              />
            </div>
            
            <div class="right-controls">
              <div class="display-toggle">
                <button 
                  :class="['toggle-btn', { active: displayMode === 'card' }]" 
                  @click="displayMode = 'card'"
                >
                  <i class="ri-layout-grid-fill"></i>
                  卡片
                </button>
                <button 
                  :class="['toggle-btn', { active: displayMode === 'list' }]" 
                  @click="displayMode = 'list'"
                >
                  <i class="ri-list-check"></i>
                  列表
                </button>
              </div>
              
              <CountSelector 
                :word-count="wordCount"
                @change-count="changeWordCount"
              />
            </div>
          </div>
          
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          
          <div v-else-if="error" class="error-state">
            <i class="ri-error-warning-line"></i>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="fetchWords">重试</button>
          </div>
          
          <!-- 卡片模式 -->
          <div v-else-if="displayMode === 'card'" class="cards-grid">
            <WordCard 
              v-if="words.length > 0"
              :key="words[currentCardIndex]?.id" 
              :word="words[currentCardIndex]"
              :words="words"
              :current-index="currentCardIndex"
              @update:current-index="currentCardIndex = $event"
              @play-explanation-video="playExplanationVideo"
            />
            
            <div class="load-more">
              <button class="btn-load-more" @click="loadMoreWords">
                <i class="ri-refresh-line"></i>
                再来一组单词
              </button>
            </div>
          </div>
          
          <!-- 列表模式 -->
          <VocabularyListMode 
            v-else
            :words="words"
            :current-level="currentLevel"
            :word-count="wordCount"
            @change-level="setLevel"
            @change-count="changeWordCount"
            @view-details="showWordDetails"
            @load-more="loadMoreWords"
          />
        </div>

        <!-- 背诵模式 -->
        <div v-if="currentTab === 'study'" class="mode-container">
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          
          <div v-else-if="error" class="error-state">
            <i class="ri-error-warning-line"></i>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="fetchWords">重试</button>
          </div>
          
          <div v-else class="study-mode">
            <div class="cards-container">
              <VocabularyStudyMode 
                :words="words"
              />
            </div>
          </div>
        </div>

        <!-- 测试模式 -->
        <div v-if="currentTab === 'test'" class="mode-container">
          <VocabularyTestMode
            :words="testWords"
            :test-level="testLevel"
            :test-count="testCount"
            :test-type="testType"
            :test-started="testStarted"
            :test-completed="testCompleted"
            :test-results="testResults"
            @update:test-level="testLevel = $event"
            @update:test-count="testCount = $event"
            @update:test-type="testType = $event"
            @update:test-started="testStarted = $event"
            @update:test-completed="testCompleted = $event"
            @update:test-results="testResults = $event"
            @start-test="startTest"
            @retry-test="retryTest"
            @back-to-setup="backToSetup"
          />
        </div>
        
        <!-- 听力练习模式 -->
        <div v-if="currentTab === 'listening'" class="mode-container">
          <VocabularyListeningMode />
        </div>
      </div>
    </div>

    <!-- 单词详情弹窗 -->
    <el-dialog
      v-model="showWordDetailDialog"
      title="单词详情"
      width="500px"
      center
      :show-close="false"
      class="word-detail-dialog"
    >
      <WordDetails 
        v-if="selectedWord" 
        :word="selectedWord"
        @play-explanation-video="playExplanationVideo"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showWordDetailDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 视频讲解弹窗 -->
    <VideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
    
    <!-- 全局加载动画 -->
    <LoadingSpinner 
      :show="globalLoading" 
      text="加载中..."
    />
  </div>
</template>

<style lang="scss" scoped>
.vocabulary-page {
  padding-bottom: var(--spacing-xxl);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
}

.mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
  
  .left-controls, .right-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }
}

.display-toggle {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    &:not(.active):hover {
      background-color: var(--background-color);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}

.mode-container {
  width: 100%;
}

.cards-container {
  width: 100%;
  min-height: 600px;
  height: auto;
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    min-height: 500px;
    height: auto;
  }
  
  @media (max-width: 480px) {
    min-height: 450px;
    height: auto;
  }
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.error-state {
  i {
    font-size: 3rem;
    color: var(--error-color);
    margin-bottom: var(--spacing-md);
  }

  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-md);
  }
}

.word-detail-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
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

.study-mode {
  width: 100%;
  
  .cards-container {
    display: block;
    width: 100%;
  }
}

.load-more {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: var(--spacing-md);
}

.btn-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  i {
    font-size: 1.2rem;
  }
}
</style>
