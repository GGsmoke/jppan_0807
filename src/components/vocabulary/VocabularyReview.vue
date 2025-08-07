<template>
  <div class="vocabulary-review">
    <div class="review-header">
      <div class="header-content">
        <div class="header-title">
          <h2>学习时刻</h2>
          <p>每天坚持背单词的你，真的超级酷！</p>
        </div>
        
        <div class="level-filters">
          <button 
            v-for="level in ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']" 
            :key="level"
            :class="['level-btn', { active: currentLevel === level }]"
            @click="setLevel(level)"
          >
            {{ level }}
          </button>
        </div>
        
        <div class="count-selector">
          <label>单词数量</label>
          <select v-model="wordCount" @change="handleCountChange">
            <option value="12">12个</option>
            <option value="20">20个</option>
            <option value="30">30个</option>
            <option value="40">40个</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="review-content">
      <div v-if="filteredWords.length > 0 && currentIndex < filteredWords.length" class="review-card">
        <ReviewCardHeader 
          :current-word="currentWord"
          :current-index="currentIndex"
          :filtered-words="filteredWords"
        />
        
        <div class="card-body">
          <WordSection 
            :current-word="currentWord"
            @play-pronunciation="playPronunciation"
            @play-explanation-video="$emit('play-explanation-video', currentWord)"
          />
          
          <MeaningSection 
            :meaning-revealed="meaningRevealed"
            :current-word="currentWord"
            @reveal-meaning="revealMeaning"
          />
          
          <ExampleSection 
            :example-revealed="exampleRevealed"
            :current-example="currentExample"
            :is-example-playing="isExamplePlaying"
            @reveal-example="revealExample"
            @play-example-pronunciation="playExamplePronunciation"
          />
        </div>
        
        <ReviewCardFooter @review-good="nextWord" @show-contact="showContactDialog = true" />
        
        <!-- 在最后一个单词的卡片上显示加载中 -->
        <div v-if="isLoading && currentIndex === filteredWords.length - 1" class="loading-overlay">
          <div class="loading-indicator">
            <i class="ri-loader-4-line spinning"></i>
            <span>加载中...</span>
          </div>
        </div>
      </div>
      
      <div v-else-if="!filteredWords.length && !isLoading" class="empty-state">
        <button class="btn-start-review" @click="fetchMoreWords">
          开始学习
          <i class="ri-arrow-right-line"></i>
        </button>
      </div>
      
      <div v-else-if="isLoading && !filteredWords.length" class="loading-state">
        <div class="loading-indicator">
          <i class="ri-loader-4-line spinning"></i>
          <span>加载中...</span>
        </div>
      </div>
    </div>
    
    <!-- Contact Dialog -->
    <el-dialog
      v-model="showContactDialog"
      title="联系客服"
      width="360px"
      center
      :show-close="false"
      class="contact-dialog"
    >
      <div class="qr-container">
        <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服微信二维码" class="qr-code">
        <p>扫码添加客服微信</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showContactDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
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
import { ref, computed, watch, onUnmounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import ReviewCardHeader from './review/ReviewCardHeader.vue'
import WordSection from './review/WordSection.vue'
import MeaningSection from './review/MeaningSection.vue'
import ExampleSection from './review/ExampleSection.vue'
import ReviewCardFooter from './review/ReviewCardFooter.vue'
import { VOCABULARY_API, DEFAULT_PARAMS } from '../../config/api-vocabulary'
import { playWordAudio, playExampleAudio, stopAllAudio as stopUtilAudio } from '../../utils/audio'


interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  example?: string
  exampleMeaning?: string
  example2?: string
  example2Meaning?: string
  example3?: string
  example3Meaning?: string
  level: string
  explanationUrl?: string
  wordAudioUrl?: string
}

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits(['changeLevel', 'changeCount', 'play-explanation-video'])
const authStore = useAuthStore()

const currentIndex = ref(0)
const meaningRevealed = ref(false)
const exampleRevealed = ref(false)
const showContactDialog = ref(false)
const isExamplePlaying = ref(false)
const currentLevel = ref('全部')
const wordCount = ref('12')
const originalWords = ref<Word[]>([])
const filteredWords = ref<Word[]>([])
const isLoading = ref(false)
const showAudioPermissionDialog = ref(false)
const isAnyAudioPlaying = ref(false)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)
const explanationVideo = ref<HTMLVideoElement | null>(null)

const reviewStats = ref({
  total: 0,
  completed: 0,
  mastered: 0
})

// 计算属性：获取当前单词
const currentWord = computed(() => {
  return filteredWords.value[currentIndex.value] || { id: '', kanji: '', kana: '', meaning: '', example: '', level: '' }
})

const currentExample = computed(() => {
  return {
    text: currentWord.value.example,
    meaning: currentWord.value.exampleMeaning
  }
})

const setLevel = (level: string) => {
  currentLevel.value = level
  emit('changeLevel', level)
  resetReviewState()
  fetchMoreWords()
}

const handleCountChange = () => {
  emit('changeCount', wordCount.value)
  resetReviewState()
  fetchMoreWords()
}

// 重置方法
const resetReviewState = () => {
  currentIndex.value = 0
  meaningRevealed.value = false
  exampleRevealed.value = false
  filteredWords.value = []
  reviewStats.value = {
    total: 0,
    completed: 0,
    mastered: 0
  }
}

// 从API获取更多单词
const fetchMoreWords = async () => {
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
      const newWords = response.data.data.map((word: any) => ({
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
      
      // 打乱顺序
      const shuffledWords = newWords.sort(() => Math.random() - 0.5)
      
      // 更新过滤后的单词数组
      filteredWords.value = shuffledWords
      
      // 更新复习统计
      reviewStats.value = {
        total: shuffledWords.length,
        completed: 0,
        mastered: 0
      }
      
      // 重置索引和状态
      currentIndex.value = 0
      meaningRevealed.value = false
      exampleRevealed.value = false
    } else {
      // 如果API返回错误，使用本地数据作为备份
      await fetchLocalWords()
    }
  } catch (err) {
    console.error('API请求失败，使用本地数据', err)
    await fetchLocalWords()
  } finally {
    isLoading.value = false
  }
}

// 从本地JSON文件获取单词（作为备份）
const fetchLocalWords = async () => {
  try {
    const response = await fetch('/db.json')
    const data = await response.json()
    
    let localWords = data.vocabulary
    
    if (currentLevel.value !== '全部') {
      localWords = localWords.filter((word: any) => word.level === currentLevel.value)
    }
    
    // 限制单词数量
    localWords = localWords.slice(0, parseInt(wordCount.value))
    
    // 打乱顺序
    const shuffledWords = localWords.sort(() => Math.random() - 0.5)
    
    // 更新过滤后的单词数组
    filteredWords.value = shuffledWords
    
    // 更新复习统计
    reviewStats.value = {
      total: shuffledWords.length,
      completed: 0,
      mastered: 0
    }
  } catch (err) {
    console.error('获取本地单词失败', err)
  }
}

const revealMeaning = () => {
  meaningRevealed.value = true
}

const revealExample = () => {
  exampleRevealed.value = true
}

// 在playPronunciation函数中
const playPronunciation = () => {
  if (!currentWord.value?.wordAudioUrl) return
  
  stopUtilAudio()
  
  playWordAudio(
    currentWord.value.wordAudioUrl,
    () => { isAnyAudioPlaying.value = true },
    () => { isAnyAudioPlaying.value = false },
    () => { isAnyAudioPlaying.value = false }
  )
}

// 在playExample函数后面添加
const playExamplePronunciation = () => {
  if (!currentWord.value?.wordAudioUrl) return
  
  stopUtilAudio()
  
  playExampleAudio(
    currentWord.value.wordAudioUrl,
    0, // 例句1
    () => { 
      isExamplePlaying.value = true
      isAnyAudioPlaying.value = true
    },
    () => { 
      isExamplePlaying.value = false
      isAnyAudioPlaying.value = false
    },
    () => { 
      isExamplePlaying.value = false
      isAnyAudioPlaying.value = false
    }
  )
}

const stopExplanationVideo = () => {
  if (explanationVideo.value) {
    explanationVideo.value.pause()
    explanationVideo.value.currentTime = 0
  }
}


const nextWord = () => {
  // 先停止所有音频播放
  stopAllAudio()
  
  currentIndex.value++
  meaningRevealed.value = false
  exampleRevealed.value = false
  reviewStats.value.completed++
  reviewStats.value.mastered++
  
  // 如果已经到达最后一个单词，自动获取更多单词
  if (currentIndex.value >= filteredWords.value.length) {
    fetchMoreWords()
  }
}

// 监听props.words变化
watch(() => props.words, (newWords) => {
  originalWords.value = [...newWords]
  
  // 如果没有单词，自动获取
  if (newWords.length === 0) {
    fetchMoreWords()
  } else {
    filteredWords.value = [...newWords]
    reviewStats.value.total = newWords.length
  }
}, { immediate: true, deep: true })

// 组件卸载时停止所有音频和视频
onUnmounted(() => {
  stopAllAudio()
  stopExplanationVideo()
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    stopExplanationVideo()
  }
})

// 停止所有音频的函数
const stopAllAudio = () => {
  // 停止语音合成
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  
  // 停止所有audio元素
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  
  // 重置播放状态
  isExamplePlaying.value = false
  isAnyAudioPlaying.value = false
}
</script>

<style lang="scss" scoped>
.vocabulary-review {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.review-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  
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

.review-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  
  .stat-item {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 10px 20px;
    border-radius: 10px;
    min-width: 80px;
    
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
}

.review-content {
  flex: 1;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xxl);
  min-height: 500px;
  position: relative;
}

.review-card {
  background-color: #f5f9ff;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

.card-body {
  padding: var(--spacing-lg);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: 500;
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-start-review {
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

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

.contact-dialog {
  .el-dialog__header {
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
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.video-dialog {
  .el-dialog__header {
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