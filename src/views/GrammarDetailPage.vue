<template>
  <div class="grammar-detail">
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>语法详情</h1>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="grammar-content" v-if="grammar">
        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <button 
            class="nav-btn prev-btn" 
            @click="previousGrammar" 
            :disabled="currentIndex === 0"
          >
            <i class="ri-arrow-left-line"></i>
            上一个
          </button>
          <button 
            class="nav-btn next-btn" 
            @click="nextGrammar" 
            :disabled="currentIndex === grammarList.length - 1"
          >
            下一个
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>

        <div class="grammar-header">
          <div class="level-badge">{{ grammar?.jlptLevel }}</div>
          <h2 class="grammar-title">{{ grammar?.grammarName }}</h2>
          <p class="grammar-form" v-if="grammar?.grammarForm">
            <span class="form-label">形式：</span>{{ grammar?.grammarForm }}
          </p>
        </div>
        
        <section class="explanation-section">
          <h3>
            <i class="ri-book-open-line"></i>
            説明
          </h3>
          <p class="jp-text">{{ grammar?.grammarMeaning }}</p>
        </section>
        
        <section class="examples-section">
          <h3>
            <i class="ri-file-list-line"></i>
            例文
          </h3>
          <div class="example-cards">
            <div v-if="grammar?.exampleSentence1" class="example-card">
              <div class="example-number">例文 1</div>
              <p class="example-japanese jp-text">{{ grammar.exampleSentence1 }}</p>
              <p class="example-chinese">{{ grammar.exampleTranslation1 }}</p>
            </div>
            <div v-if="grammar?.exampleSentence2" class="example-card">
              <div class="example-number">例文 2</div>
              <p class="example-japanese jp-text">{{ grammar.exampleSentence2 }}</p>
              <p class="example-chinese">{{ grammar.exampleTranslation2 }}</p>
            </div>
            <div v-if="grammar?.exampleSentence3" class="example-card">
              <div class="example-number">例文 3</div>
              <p class="example-japanese jp-text">{{ grammar.exampleSentence3 }}</p>
              <p class="example-chinese">{{ grammar.exampleTranslation3 }}</p>
            </div>
          </div>
        </section>
        
        <div class="grammar-actions">
          <button class="btn-back" @click="router.back()">
            <i class="ri-arrow-left-line"></i>
            返回列表
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <i class="ri-loader-4-line spinning"></i>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <i class="ri-error-warning-line"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="fetchGrammarList">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const API_URL = 'https://www.dlmy.tech/chunshua-api/chunshua_questions/grammar/grammerCards'

interface Grammar {
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
}

const grammar = ref<Grammar | null>(null)
const grammarList = ref<Grammar[]>([])
const currentIndex = ref(0)
const loading = ref(false)
const error = ref('')

// 获取语法列表
const fetchGrammarList = async () => {
  if (!authStore.isLoggedIn) {
    router.push({
      path: '/auth/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  loading.value = true
  error.value = ''

  try {
    const config = {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      loginType: 2,
      useType: 2,
      userTypeUseGrammarId: 0,
      jpltLevel: 'N', // 获取所有等级
      grammarCount: 1000 // 获取更多语法
    }

    const response = await axios.post(API_URL, config)

    if (response.data.code === 200) {
      grammarList.value = response.data.data
      
      // 如果有传入的语法ID，找到对应的索引
      const grammarId = route.params.id
      if (grammarId) {
        const index = grammarList.value.findIndex(g => g.grammarId === parseInt(grammarId as string))
        if (index !== -1) {
          currentIndex.value = index
        }
      } else {
        // 如果没有ID，尝试从sessionStorage获取
        const storedGrammar = sessionStorage.getItem('currentGrammar')
        if (storedGrammar) {
          const parsedGrammar = JSON.parse(storedGrammar)
          const index = grammarList.value.findIndex(g => g.grammarId === parsedGrammar.grammarId)
          if (index !== -1) {
            currentIndex.value = index
          }
        }
      }
      
      // 设置当前语法
      if (grammarList.value.length > 0) {
        grammar.value = grammarList.value[currentIndex.value]
      }
    } else {
      throw new Error(response.data.msg || '获取语法列表失败')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取语法列表失败，请稍后重试'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 上一个语法
const previousGrammar = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    grammar.value = grammarList.value[currentIndex.value]
    // 更新URL
    router.replace(`/grammar/${grammar.value.grammarId}`)
  }
}

// 下一个语法
const nextGrammar = () => {
  if (currentIndex.value < grammarList.value.length - 1) {
    currentIndex.value++
    grammar.value = grammarList.value[currentIndex.value]
    // 更新URL
    router.replace(`/grammar/${grammar.value.grammarId}`)
  }
}

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    previousGrammar()
  } else if (event.key === 'ArrowRight') {
    nextGrammar()
  }
}

onMounted(() => {
  fetchGrammarList()
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown)
})

// 清理事件监听器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.grammar-detail {
  padding-bottom: var(--spacing-xxl);
  min-height: calc(100vh - 60px);
  background-color: var(--background-color);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-lg);
  }

  h1 {
    font-size: 2rem;
    margin: 0;
  }
}

.grammar-content {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid var(--primary-color);
  background-color: white;
  color: var(--primary-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;

  &:hover:not(:disabled) {
    background-color: var(--primary-color);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--border-color);
    color: var(--text-light);
  }

  i {
    font-size: 1.1rem;
  }
}

.grammar-header {
  position: relative;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.level-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--primary-color);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.grammar-title {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
  padding-right: 100px;
  color: var(--primary-color);
}

.grammar-form {
  color: var(--text-light);
  font-size: 1.1rem;
  
  .form-label {
    font-weight: 500;
    color: var(--text-color);
  }
}

section {
  margin-bottom: var(--spacing-xl);

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: var(--spacing-sm);

    i {
      font-size: 1.4rem;
    }
  }
}

.explanation-section {
  .jp-text {
    font-size: 1.2rem;
    line-height: 1.8;
    color: var(--text-color);
    background-color: var(--background-color);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-color);
  }
}

.example-cards {
  display: grid;
  gap: var(--spacing-md);
}

.example-card {
  background-color: var(--background-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--accent-color);
  position: relative;
  transition: transform var(--transition-fast);
  
  &:hover {
    transform: translateY(-3px);
  }

  .example-number {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    font-size: 0.9rem;
    color: var(--text-light);
    background-color: rgba(255, 255, 255, 0.7);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .example-japanese {
    font-size: 1.2rem;
    margin-bottom: var(--spacing-md);
    line-height: 1.8;
  }

  .example-chinese {
    color: var(--text-light);
    font-size: 1.1rem;
    line-height: 1.6;
    padding-top: var(--spacing-md);
    border-top: 1px dashed var(--border-color);
  }
}

.grammar-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  i {
    font-size: 1.1rem;
  }
}

// 加载和错误状态
.loading-state, .error-state {
  text-align: center;
  padding: var(--spacing-xxl);
  
  i {
    font-size: 3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }
  
  p {
    font-size: 1.1rem;
    color: var(--text-light);
    margin-bottom: var(--spacing-lg);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .grammar-title {
    font-size: 1.5rem;
  }
  
  .level-badge {
    position: relative;
    display: inline-block;
    margin-bottom: var(--spacing-sm);
    top: auto;
    right: auto;
  }
  
  .grammar-header {
    text-align: center;
  }

  .navigation-buttons {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .nav-btn {
    justify-content: center;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>