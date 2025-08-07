<template>
  <div class="grammar-page">
    <div class="page-header">
      <div class="container">
        <h1>文法</h1>
        <p>千条语法 从初级到高级 全覆盖 全面学习</p>
      </div>
    </div>

    <div class="container">
      <div class="grammar-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.name }}
        </button>
      </div>

      <!-- 语法列表模式 -->
      <div v-if="currentTab === 'list'" class="tab-content">
        <div class="grammar-filters">
          <div class="filter-group">
            <label>等级</label>
            <div class="filter-buttons">
              <button 
                v-for="level in levels"
                :key="level"
                :class="['filter-btn', { active: currentLevel === level }]"
                @click="setLevel(level)"
              >
                {{ level }}
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label>显示模式</label>
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
          </div>
        </div>

        <div v-if="loading && !grammarPoints.length" class="loading-state">
          <el-skeleton :rows="4" animated />
        </div>

        <div v-else-if="error" class="error-state">
          <i class="ri-error-warning-line"></i>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="fetchGrammar">重试</button>
        </div>

        <div v-else>
          <!-- 卡片模式 -->
          <div v-if="displayMode === 'card'" class="grammar-grid">
            <div 
              v-for="point in grammarPoints" 
              :key="point.grammarId"
              class="grammar-card detailed-card"
            >
              <div class="grammar-card-header">
                <div class="level-badge" :class="getLevelClass(point.jlptLevel)">{{ point.jlptLevel }}</div>
                <h3 class="grammar-title">{{ point.grammarName }}</h3>
              </div>
              
              <div class="grammar-card-body">
                <!-- 语法含义 -->
                <div class="grammar-meaning-section">
                  <h4 class="section-title">
                    <i class="ri-book-open-line"></i>
                    説明
                  </h4>
                  <p class="explanation">{{ point.grammarMeaning }}</p>
                </div>
                
                <!-- 例句部分 -->
                <div class="examples-section">
                  <h4 class="section-title">
                    <i class="ri-file-list-line"></i>
                    例文
                  </h4>
                  
                  <!-- 例句1 -->
                  <div class="example-item" v-if="point.exampleSentence1">
                    <div class="example-number">例文 1</div>
                    <p class="jp-text">{{ point.exampleSentence1 }}</p>
                    <p class="cn-text">{{ point.exampleTranslation1 }}</p>
                  </div>
                  
                  <!-- 例句2 -->
                  <div class="example-item" v-if="point.exampleSentence2">
                    <div class="example-number">例文 2</div>
                    <p class="jp-text">{{ point.exampleSentence2 }}</p>
                    <p class="cn-text">{{ point.exampleTranslation2 }}</p>
                  </div>
                  
                  <!-- 例句3 -->
                  <div class="example-item" v-if="point.exampleSentence3">
                    <div class="example-number">例文 3</div>
                    <p class="jp-text">{{ point.exampleSentence3 }}</p>
                    <p class="cn-text">{{ point.exampleTranslation3 }}</p>
                  </div>
                </div>
              </div>
              
              <div class="grammar-card-footer">
                <button 
                  v-if="point.grammarSpeakVideoUrl"
                  class="btn-explanation" 
                  @click.stop="showGrammarExplanation(point)"
                >
                  <i class="ri-video-line"></i>
                  讲解视频
                </button>
              </div>
            </div>
          </div>
          
          <!-- 列表模式 -->
          <div v-else class="grammar-list">
            <div 
              v-for="point in grammarPoints" 
              :key="point.grammarId"
              class="grammar-list-item"
            >
              <div class="grammar-list-header">
                <div class="level-badge">{{ point.jlptLevel }}</div>
                <h3 class="grammar-title">{{ point.grammarName }}</h3>
              </div>
              
              <div class="grammar-list-body">
                <p class="explanation">{{ point.grammarMeaning }}</p>
                
                <div class="example-preview" v-if="point.exampleSentence1">
                  <p class="jp-text">{{ point.exampleSentence1 }}</p>
                  <p class="cn-text">{{ point.exampleTranslation1 }}</p>
                </div>
              </div>
              
              <div class="grammar-list-actions">
                <button class="btn-detail" @click="navigateToDetail(point)">
                  查看详情
                  <i class="ri-arrow-right-line"></i>
                </button>
                <button 
                  v-if="point.grammarSpeakVideoUrl"
                  class="btn-explanation" 
                  @click="showGrammarExplanation(point)"
                >
                  <i class="ri-video-line"></i>
                  讲解视频
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="load-more" v-if="grammarPoints.length > 0">
          <button 
            class="btn btn-primary" 
            @click="loadMore"
            :disabled="loading"
          >
            {{ loading ? '加载中...' : '再来一组语法' }}
          </button>
        </div>
      </div>

      <!-- 练习模式 -->
      <div v-if="currentTab === 'practice'" class="tab-content">
        <div v-if="!practiceStarted" class="practice-intro">
          <div class="practice-header">
            <div class="header-content">
              <div class="header-title">
                <h2>学习时刻</h2>
                <p>每天坚持学习语法的你，真的超级酷！</p>
              </div>
              
              <div class="level-filters">
                <button 
                  v-for="level in ['全部', 'N1', 'N2', 'N3', 'N4', 'N5']" 
                  :key="level"
                  :class="['level-btn', { active: practiceLevelValue === level }]"
                  @click="handlePracticeLevelChange(level)"
                >
                  {{ level }}
                </button>
              </div>
              
              <button class="btn-start-practice" @click="startPractice">
                开始学习
                <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="practice-content">
          <div class="grammar-review-card" v-if="currentGrammar">
            <div class="card-header">
              <div :class="['level-badge', getLevelClass(currentGrammar.jlptLevel)]">{{ currentGrammar.jlptLevel }}</div>
            
            </div>

            <div class="card-body">
              <div class="grammar-section">
                <h3 class="grammar-title">{{ currentGrammar.grammarName }}</h3>
              </div>
              
              <div class="meaning-section" :class="{ 'revealed': meaningRevealed }">
                <button v-if="!meaningRevealed" class="btn-reveal" @click="revealMeaning">
                  <i class="ri-eye-line"></i>
                  显示含义
                </button>
                <div v-else class="meaning">
                  <p>{{ currentGrammar.grammarMeaning }}</p>
                </div>
              </div>
              
              <div class="example-section" :class="{ 'revealed': exampleRevealed }">
                <button v-if="!exampleRevealed" class="btn-reveal" @click="revealExample">
                  <i class="ri-eye-line"></i>
                  显示例句
                </button>
                <div v-else class="example">
                  <p class="jp-text">{{ currentGrammar.exampleSentence1 }}</p>
                  <p class="example-meaning">{{ currentGrammar.exampleTranslation1 }}</p>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="review-actions">
                <button class="btn-good" @click="nextGrammar">
                  <i class="ri-check-line"></i>
                  再来一个
                </button>
                <button class="btn-easy" @click="showContactDialog = true">
                  <i class="ri-wechat-line"></i>
                  联系我们
                </button>
              </div>
            </div>

            <!-- 在最后一个语法的卡片上显示加载中 -->
            <div v-if="isLoading && currentGrammarIndex === practiceGrammarPoints.length - 1" class="loading-overlay">
              <div class="loading-indicator">
                <i class="ri-loader-4-line spinning"></i>
                <span>加载中...</span>
              </div>
            </div>
          </div>
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
    
    <!-- 全局加载动画 -->
    <LoadingSpinner 
      :show="globalLoading" 
      text="加载中..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { FEATURE_FLAGS } from '../config/features'
import { getVideoUrl } from '../utils/crypto'

const router = useRouter()
const authStore = useAuthStore()

const API_URL = 'https://www.dlmy.tech/chunshua-api/chunshua_questions/grammar/grammerCards'

const getConfig = () => {
  return {
    userId: authStore.userInfo?.userId || '',
    token: authStore.token || '',
    user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
    loginType: 2,
    useType: 2,
    userTypeUseGrammarId: 0,
    jpltLevel: currentLevel.value === '全部' ? 'N' : currentLevel.value,
    grammarCount: 6
  }
}

interface GrammarPoint {
  grammarId: number
  grammarName: string
  grammarForm: string
  grammarMeaning: string
  exampleSentence1: string
  exampleTranslation1: string
  exampleSentence2: string
  exampleTranslation2: string
  exampleSentence3: string
  exampleTranslation3: string
  jlptLevel: string
  grammarSpeakVideoUrl?: string
}

// 通用状态
const tabs = [
  { id: 'list', name: '语法列表', icon: 'ri-list-check' },
  { id: 'practice', name: '学习时刻', icon: 'ri-book-read-line' }
]
const currentTab = ref('list')
const currentLevel = ref('全部')
const displayMode = ref('list') // 默认为列表模式
const grammarPoints = ref<GrammarPoint[]>([])
const loading = ref(false)
const error = ref('')
const globalLoading = ref(false)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 联系我们对话框
const showContactDialog = ref(false)

// 练习模式状态
const practiceStarted = ref(false)
const practiceLevelValue = ref('全部')
const practiceGrammarPoints = ref<GrammarPoint[]>([])
const currentGrammarIndex = ref(0)
const meaningRevealed = ref(false)
const exampleRevealed = ref(false)
const isLoading = ref(false)

const levels = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']

const currentGrammar = computed(() => {
  return practiceGrammarPoints.value[currentGrammarIndex.value] || null
})

const setLevel = async (level: string) => {
  if (level === currentLevel.value) return
  
  currentLevel.value = level
  grammarPoints.value = []
  await fetchGrammar()
}

const fetchGrammar = async () => {
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
    const config = getConfig()
    const response = await axios.post(API_URL, config)

    if (response.data.code === 200) {
      grammarPoints.value = response.data.data
    } else {
      throw new Error(response.data.msg || '获取语法失败')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取语法失败，请稍后重试'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

const loadMore = () => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  fetchGrammar()
}

const navigateToDetail = (grammar: GrammarPoint) => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  
  // Store grammar data in sessionStorage
  sessionStorage.setItem('currentGrammar', JSON.stringify(grammar))
  router.push(`/grammar/${grammar.grammarId}`)
}

// 显示语法讲解视频
const showGrammarExplanation = (grammar: GrammarPoint) => {
  if (!grammar.grammarSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(grammar.grammarSpeakVideoUrl)
  explanationVideoUrl.value = videoUrl
  showVideoDialog.value = true
}

// 练习模式相关方法
const handlePracticeLevelChange = (level: string) => {
  practiceLevelValue.value = level
}

const startPractice = async () => {
  isLoading.value = true
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  
  try {
    const config = {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      loginType: 2,
      useType: 2,
      userTypeUseGrammarId: 0,
      jpltLevel: practiceLevelValue.value === '全部' ? 'N' : practiceLevelValue.value,
      grammarCount: 10
    }
    
    const response = await axios.post(API_URL, config)

    if (response.data.code === 200) {
      practiceGrammarPoints.value = response.data.data
      currentGrammarIndex.value = 0
      meaningRevealed.value = false
      exampleRevealed.value = false
      practiceStarted.value = true
    } else {
      throw new Error(response.data.msg || '获取语法失败')
    }
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '获取语法失败，请稍后重试')
  } finally {
    isLoading.value = false
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

const revealMeaning = () => {
  meaningRevealed.value = true
}

const revealExample = () => {
  exampleRevealed.value = true
}

const nextGrammar = async () => {
  // 先重置状态
  meaningRevealed.value = false
  exampleRevealed.value = false
  
  // 移动到下一个语法
  currentGrammarIndex.value++
  
  // 如果已经到达最后一个语法，自动获取更多语法
  if (currentGrammarIndex.value >= practiceGrammarPoints.value.length) {
    isLoading.value = true
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = true
    }
    
    try {
      const config = {
        userId: authStore.userInfo?.userId || '',
        token: authStore.token || '',
        user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
        loginType: 2,
        useType: 2,
        userTypeUseGrammarId: 0,
        jpltLevel: practiceLevelValue.value === '全部' ? 'N' : practiceLevelValue.value,
        grammarCount: 10
      }
      
      const response = await axios.post(API_URL, config)

      if (response.data.code === 200) {
        practiceGrammarPoints.value = response.data.data
        currentGrammarIndex.value = 0
      } else {
        throw new Error(response.data.msg || '获取语法失败')
      }
    } catch (err) {
      ElMessage.error(err instanceof Error ? err.message : '获取语法失败，请稍后重试')
    } finally {
      isLoading.value = false
      if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
        globalLoading.value = false
      }
    }
  }
}

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

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  fetchGrammar()
})
</script>

<style lang="scss" scoped>
.grammar-page {
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

.grammar-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);

  i {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}

.grammar-filters {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  justify-content: space-between;
}

.filter-group {
  flex: 1;
  min-width: 200px;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
  }
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;

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

.grammar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.grammar-card.detailed-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  cursor: default;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  border: none;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);

    .btn-detail {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);

      i {
        transform: translateX(4px);
      }
    }
  }
}

.grammar-card-header {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;

  i {
    font-size: 1.1rem;
  }
}

.grammar-form-section {
  .grammar-form {
    background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
    padding: 12px 16px;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-color);
    margin: 0;
  }
}

.grammar-meaning-section {
  .explanation {
    font-size: 1.1rem;
    color: var(--text-color);
    line-height: 1.6;
    margin: 0;
    font-weight: 500;
    background: linear-gradient(135deg, #f8faff, #e8f2ff);
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid var(--accent-color);
  }
}

.examples-section {
  .example-item {
    background: linear-gradient(135deg, #fff8f0, #ffeee6);
    padding: 16px;
    border-radius: 12px;
    border-left: 4px solid #ff9800;
    margin-bottom: var(--spacing-md);
    position: relative;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .example-number {
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 0.8rem;
      color: var(--text-light);
      background-color: rgba(255, 255, 255, 0.8);
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }
    
    .jp-text {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 8px;
      color: var(--text-color);
      font-weight: 500;
      padding-right: 60px;
    }
    
    .cn-text {
      font-size: 0.95rem;
      color: var(--text-light);
      line-height: 1.5;
      margin: 0;
      padding-top: 8px;
      border-top: 1px dashed rgba(255, 152, 0, 0.3);
    }
  }
}

.grammar-card-footer {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.btn-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  flex: 1;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }
  
  i {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grammar-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .grammar-card.detailed-card {
    min-height: auto;
    margin-bottom: var(--spacing-md);
  }
  
  .grammar-card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    text-align: left;
    padding: 20px;
  }
  
  .grammar-title {
    font-size: 1.4rem;
    margin-right: 0;
    margin-bottom: 8px;
    line-height: 1.3;
    text-align: left;
    width: 100%;
    word-break: break-word;
  }
  
  .level-badge {
    align-self: flex-end;
    margin-bottom: 0;
    font-size: 0.8rem;
    padding: 6px 12px;
  }
  
  .grammar-card-body {
    padding: 16px 20px;
    gap: var(--spacing-md);
  }
  
  .section-title {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .grammar-form-section {
    .grammar-form {
      font-size: 1rem;
      padding: 10px 12px;
    }
  }
  
  .grammar-meaning-section {
    .explanation {
      font-size: 1rem;
      padding: 12px;
      line-height: 1.5;
    }
  }
  
  .examples-section {
    .example-item {
      padding: 12px;
      margin-bottom: 10px;
      
      .jp-text {
        font-size: 1rem;
        padding-right: 0;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      
      .cn-text {
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .example-number {
        position: relative;
        top: auto;
        right: auto;
        display: inline-block;
        margin-bottom: 6px;
        font-size: 0.75rem;
        padding: 1px 6px;
      }
    }
  }
  
  .grammar-card-footer {
    flex-direction: column;
    gap: 10px;
    padding: 16px 20px;
  }
  
  .btn-detail {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .btn-explanation {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .grammar-card-header {
    padding: 16px;
  }
  
  .grammar-title {
    font-size: 1.2rem;
  }
  
  .grammar-card-body {
    padding: 12px 16px;
  }
  
  .grammar-card-footer {
    padding: 12px 16px;
  }
  
  .level-badge {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}

.level-badge {
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  // ... existing code ...
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &.level-n5 { 
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: #1b5e20; // 深绿色文字替代白色
  }
  &.level-n4 { 
    background: linear-gradient(135deg, #2196F3, #1976d2);
    color: #0d47a1; // 深蓝色文字替代白色
  }
  &.level-n3 { 
    background: linear-gradient(135deg, #FF9800, #f57c00);
    color: #e65100; // 深橙色文字替代白色
  }
  &.level-n2 { 
    background: linear-gradient(135deg, #F44336, #d32f2f);
    color: #b71c1c; // 深红色文字替代白色
  }
  &.level-n1 { 
    background: linear-gradient(135deg, #9C27B0, #7b1fa2);
    color: #4a148c; // 深紫色文字替代白色
  }
}

.grammar-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
  flex: 1;
  margin-right: 16px;
}

.grammar-card-body {
  flex: 1;
  padding: 24px;
  background: white;
  display: flex;
  flex-direction: column;
}

.explanation {
  font-size: 1.1rem;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 20px;
  font-weight: 500;
}

.example-preview {
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  margin-top: auto;
  
  .jp-text {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 8px;
    color: var(--text-color);
    font-weight: 500;
  }
  
  .cn-text {
    font-size: 0.95rem;
    color: var(--text-light);
    line-height: 1.5;
  }
}

.grammar-card-footer {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.btn-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  flex: 1;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }
  
  i {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }
}

.btn-explanation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #f57c00;
  border: 2px solid #fff3e0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  
  &:hover {
    background: linear-gradient(135deg, #ffe0b2, #ffcc80);
    border-color: #ff9800;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  i {
    font-size: 1.1rem;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grammar-card-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }
  
  .grammar-title {
    font-size: 1.5rem;
    margin-right: 0;
  }
  
  .grammar-card-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-detail {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .grammar-card-header {
    padding: 20px;
  }
  
  .grammar-card-body {
    padding: 20px;
  }
  
  .grammar-title {
    font-size: 1.3rem;
  }
  
  .explanation {
    font-size: 1rem;
  }
}

.grammar-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.grammar-list-item {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border-left: 3px solid var(--primary-color);
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.grammar-list-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .grammar-title {
    font-size: 1.2rem;
    margin: 0;
  }
  
  .level-badge {
    position: static;
  }
}

.grammar-list-body {
  padding: var(--spacing-md);
  
  .explanation {
    margin-bottom: var(--spacing-md);
  }
}

.grammar-list-actions {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
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

.load-more {
  text-align: center;
  margin-top: var(--spacing-xl);

  button {
    padding: 12px 30px;
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* 练习模式样式 */
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
  padding: var(--spacing-lg);
}

.grammar-review-card {
  background-color: #f5f9ff;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

.card-body {
  padding: var(--spacing-lg);
}

.grammar-section {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  .grammar-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
}

.meaning-section, .example-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--border-radius);
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.revealed {
    border-left: 4px solid var(--primary-color);
  }
  
  .btn-reveal {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .meaning, .example {
    width: 100%;
    
    p {
      margin-bottom: 0;
      font-size: 1.2rem;
      color: var(--primary-color);
      font-weight: 500;
    }
    
    .jp-text {
      font-size: 1.2rem;
      margin-bottom: var(--spacing-sm);
    }
    
    .example-meaning {
      color: #666;
      font-size: 1rem;
      margin-bottom: var(--spacing-sm);
    }
  }
}

.card-footer {
  padding: var(--spacing-md);
  background-color: white;
  border-top: 1px solid #f0f0f0;
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  .btn-good {
    background-color: #e8f5e9;
    color: #43a047;
    
    &:hover {
      background-color: #c8e6c9;
    }
  }
  
  .btn-easy {
    background-color: #fff8e1;
    color: #ffa000;
    
    &:hover {
      background-color: #ffecb3;
    }
  }
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

.contact-dialog {
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
    }
  }
}
</style>