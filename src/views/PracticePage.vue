<template>
  <div class="practice-page">
    <div class="page-header">
      <div class="container">
        <h1>试题练习</h1>
        <p>N5到N1万道真题模拟题 越刷越爽 越爽越提分</p>
      </div>
    </div>

    <div class="container">
      <div class="practice-filters">
        <div class="filter-group">
          <label>等级</label>
          <div class="filter-buttons">
            <button 
              v-for="level in levels"
              :key="level"
              :class="['filter-btn', { active: currentLevel === level }]"
              @click="currentLevel = level"
            >
              {{ level }}
            </button>
          </div>
        </div>
      </div>

      <div class="practice-grid">
        <div v-for="level in filteredLevels" :key="level" class="level-group">
          <h2 class="level-title">
            <span :class="['level-badge', getLevelClass(level)]">
              {{ level }}
            </span>
            <span class="level-name">{{ getLevelName(level) }}</span>
          </h2>
          
          <div class="level-content">
            <div class="desktop-layout">
              <div v-for="type in types" :key="type" class="type-section">
                <h3 class="type-title">{{ type }}</h3>
                <div class="questions-list">
                  <div 
                    v-for="question in getQuestionsByLevelAndType(level, type)" 
                    :key="question.questionBankId"
                    class="question-card"
                    @click="startPractice(question)"
                  >
                    <div class="question-info">
                      <h4 class="question-title">{{ question.question }}</h4>
                      <p class="question-description">{{ getQuestionDescription(question) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mobile-layout">
              <div class="mobile-tabs">
                <button 
                  v-for="type in types"
                  :key="type"
                  :class="['mobile-tab', { active: activeMobileTab[level] === type }]"
                  @click="setActiveMobileTab(level, type)"
                >
                  {{ type }}
                </button>
              </div>
              
              <div class="mobile-content">
                <div class="questions-list">
                  <div 
                    v-for="question in getQuestionsByLevelAndType(level, activeMobileTab[level] || '词汇')" 
                    :key="question.questionBankId"
                    class="question-card"
                    @click="startPractice(question)"
                  >
                    <div class="question-info">
                      <h4 class="question-title">{{ question.question }}</h4>
                      <p class="question-description">{{ getQuestionDescription(question) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Dialog -->
    <el-dialog
      v-model="showPurchaseDialog"
      title="开通会员"
      width="360px"
      center
      :show-close="false"
      destroy-on-close
      class="purchase-dialog"
    >
      <div class="qr-container">
        <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服二维码" class="qr-code">
        <p>扫码添加客服微信，开通会员</p>
        <p class="tip">开通会员后，手机APP也可同步使用</p>
      </div>
    </el-dialog>

     <!-- Download Dialog -->
    <el-dialog
      v-model="showDownloadDialog"
      title="下载纯刷日语APP"
      width="360px"
      center
      :show-close="false"
      destroy-on-close
      class="download-dialog"
    >
      <div class="download-options">
        <div class="download-option">
          <h4>安卓</h4>
          <img 
            src="https://csry.oss-cn-beijing.aliyuncs.com/csry_android.png" 
            alt="Android版二维码" 
            class="qr-code"
          >
        </div>
        <div class="download-option">
          <h4>苹果</h4>
          <img 
            src="https://csry.oss-cn-beijing.aliyuncs.com/csry_ios.png" 
            alt="iOS版二维码" 
            class="qr-code"
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDownloadDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { questionBanks } from '../config/questionBanks'

const router = useRouter()
const authStore = useAuthStore()

const currentLevel = ref('全部')
const showPurchaseDialog = ref(false)
const showDownloadDialog = ref(false)
const activeMobileTab = reactive<Record<string, string>>({})

const levels = ['全部', 'N1', 'N2', 'N3', 'N4', 'N5']
const types = ['词汇', '文法', '読解', '聴解']

const filteredLevels = computed(() => {
  if (currentLevel.value === '全部') {
    return ['N1', 'N2', 'N3', 'N4', 'N5']
  }
  return [currentLevel.value]
})

const getQuestionsByLevelAndType = (level: string, type: string) => {
  return questionBanks.filter(q => q.jlptLevel === level && q.tixing === type)
}

const getLevelClass = (level: string) => {
  return {
    'level-n1': level === 'N1',
    'level-n2': level === 'N2',
    'level-n3': level === 'N3',
    'level-n4': level === 'N4',
    'level-n5': level === 'N5'
  }
}

const getLevelName = (level: string) => {
  const names: Record<string, string> = {
    'N1': '上级',
    'N2': '中上级',
    'N3': '中级',
    'N4': '初中级',
    'N5': '初级'
  }
  return names[level] || ''
}

const setActiveMobileTab = (level: string, type: string) => {
  activeMobileTab[level] = type
}

// Initialize mobile tabs
filteredLevels.value.forEach(level => {
  if (!activeMobileTab[level]) {
    activeMobileTab[level] = '词汇'
  }
})

const getQuestionDescription = (question: any) => {
  // Add descriptions based on question type and content
  const descriptions: { [key: string]: string } = {
    '词汇': '考察汉字读音、书写和词语用法',
    '文法': '测试语法规则和句子结构的掌握程度',
    '読解': '训练阅读理解和文章分析能力',
    '聴解': '提高听力理解和口语交际能力'
  }
  return descriptions[question.tixing] || ''
}

const startPractice = (question: any) => {
  if (!authStore.isLoggedIn) {
    router.push({
      path: '/auth/login',
      query: { redirect: `/practice/${question.questionBankId}` }
    })
    return
  }

  const level = question.jlptLevel as keyof typeof authStore.permissions
  if (!authStore.hasPermission(level)) {
    showPurchaseDialog.value = true
    return
  }

  // Store question data in sessionStorage
  sessionStorage.setItem('currentQuestion', JSON.stringify(question))
  router.push(`/practice/${question.questionBankId}`)
}

const downloadApp = () => {
  showPurchaseDialog.value = false
  showDownloadDialog.value = true
}
</script>

<style lang="scss" scoped>
.practice-page {
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

.practice-filters {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
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

.practice-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxl);
}

.level-group {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.level-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);

  .level-badge {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    
    &.level-n1 { background-color: #9C27B0; }
    &.level-n2 { background-color: #F44336; }
    &.level-n3 { background-color: #FF9800; }
    &.level-n4 { background-color: #2196F3; }
    &.level-n5 { background-color: #4CAF50; }
  }
  
  .level-name {
    font-size: 1.1rem;
    color: var(--text-light);
  }
}

.level-content {
  .desktop-layout {
    display: flex;
    gap: var(--spacing-lg);
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  .mobile-layout {
    display: none;
    
    @media (max-width: 768px) {
      display: block;
    }
  }
}

.type-section {
  flex: 1;
  min-width: 0;
  
  .type-title {
    font-size: 1.1rem; // 从1.2rem减小
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
    padding-bottom: 6px; // 减小底部间距
    border-bottom: 1px solid var(--border-color);
    text-align: center;
  }
}

.questions-list {
  // 桌面端：横向显示题目，减小间距
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px; // 从var(--spacing-sm)减小到8px
  
  @media (max-width: 768px) {
    // 手机端：纵向显示题目
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

.question-card {
  // 桌面端：减小卡片宽度，增加列数
  flex: 0 0 calc(33.333% - var(--spacing-xs));
  min-width: 160px; // 从200px减小到160px
  padding: var(--spacing-xs) var(--spacing-sm); // 减小内边距
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.85rem; // 减小字体
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex: 1 1 auto;
    min-width: unset;
  }

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

// 针对不同屏幕尺寸的优化
@media (min-width: 1200px) {
  .question-card {
    // 大屏幕：4列显示
    flex: 0 0 calc(25% - var(--spacing-sm));
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .question-card {
    // 中等屏幕：3列显示
    flex: 0 0 calc(33.333% - var(--spacing-sm));
  }
}

@media (min-width: 769px) and (max-width: 991px) {
  .question-card {
    // 小桌面屏幕：2列显示，卡片更紧凑
    flex: 0 0 calc(50% - var(--spacing-sm));
    min-width: 140px; // 进一步减小
    padding: 6px 8px; // 更紧凑的内边距
  }
  
  .question-info {
    .question-title {
      font-size: 0.9rem; // 从1rem减小到0.9rem
      font-weight: 600;
      margin-bottom: 4px; // 减小间距
      line-height: 1.3; // 紧凑行高
    }
    
    .question-description {
      font-size: 0.8rem;
      color: var(--text-light);
      line-height: 1.3;
      // 限制描述文字行数，避免卡片高度不一致
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2; // 添加标准属性
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

.mobile-tabs {
  display: flex;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.mobile-tab {
  flex: 1;
  background: none;
  border: none;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 2px solid transparent;
  
  &:hover {
    background-color: var(--bg-light);
  }
  
  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: 500;
  }
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.question-card {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
}

.question-info {
  .question-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
  }
  
  .question-description {
    font-size: 0.9rem;
    color: var(--text-light);
    line-height: 1.4;
  }
}

.purchase-dialog,
.download-dialog {
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

  .download-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
  }

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: white;
    font-weight: 500;
    transition: opacity var(--transition-fast);

    &:hover {
      opacity: 0.9;
    }

    i {
      font-size: 1.2rem;
    }

    &.android {
      background-color: #3DDC84;
    }

    &.ios {
      background-color: #000000;
    }
  }
}
.download-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .download-options {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) 0;
  }

  .download-option {
    flex: 1;
    text-align: center;

    h4 {
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
    }

    .qr-code {
      width: 120px;
      height: 120px;
      border-radius: var(--border-radius);
    }
  }
}


.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
  .download-btn {
  display: none;
  align-items: center;
  background-color: var(--accent-color);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  @media (min-width: 768px) {
    display: flex;
  }
  
  i {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: var(--accent-dark);
  }
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    display: none;
  }
}
</style>