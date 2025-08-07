<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <div class="profile-info">
          <div class="profile-details">
            <h1>{{ authStore.userInfo?.userName }}</h1>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-redeem" @click="showRedeemDialog = true">
            <i class="ri-coupon-line"></i>
            兑换码
          </button>
          <button class="btn-edit" @click="navigateToEdit">
            <i class="ri-edit-line"></i>
            修改密码
          </button>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-section">
          <h2><i class="ri-user-3-line"></i> 基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>用户账号</label>
              <span>{{ authStore.userInfo?.userAccount }}</span>
            </div>
            <div class="info-item">
              <label>手机号</label>
              <span>{{ authStore.phoneNumber || authStore.userInfo?.phoneNumber || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>邮箱</label>
              <span>{{ authStore.userInfo?.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>账号状态</label>
              <span :class="['status-badge', authStore.userInfo?.isActive ? 'active' : 'inactive']">
                {{ authStore.userInfo?.isActive ? '已激活' : '未激活' }}
              </span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2><i class="ri-vip-crown-2-line"></i> 会员信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>会员状态</label>
              <div class="vip-status-container">
                <!-- 主要会员状态标签 -->
                <div class="main-status">
                  <span 
                    :class="['status-badge', 'main-badge', getMainStatusClass()]"
                    @click="handleMainStatusClick"
                  >
                    {{ getMainStatusText() }}
                  </span>
                </div>
                
                <!-- VIP功能标签 -->
                <div class="vip-features">
                  <span 
                    :class="['feature-badge', getAudioFeatureClass()]"
                    @click="handleFeatureClick('audio')"
                  >
                    <i class="ri-volume-up-line"></i>
                    单词及例句音频VIP
                  </span>
                  <span 
                    :class="['feature-badge', getVideoFeatureClass()]"
                    @click="handleFeatureClick('video')"
                  >
                    <i class="ri-video-line"></i>
                    题目视频讲解VIP
                  </span>
                  <span 
                    :class="['feature-badge', getCourseFeatureClass()]"
                    @click="handleFeatureClick('course')"
                  >
                    <i class="ri-book-open-line"></i>
                    课件学习VIP
                  </span>
                </div>
                
                <!-- 说明文本 -->
                <div class="vip-description">
                  <p>{{ getDescriptionText() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2><i class="ri-award-line"></i> JLPT等级权限</h2>
          <div class="jlpt-grid">
            <div 
              v-for="level in ['N1', 'N2', 'N3', 'N4', 'N5']" 
              :key="level"
              :class="['jlpt-item', { 'not-activated': !hasJlptAccess(level) }]"
              @click="handleLevelClick(level)"
            >
              <div class="level-badge">{{ level }}</div>
              <div :class="['access-status', hasJlptAccess(level) ? 'has-access' : 'no-access']">
                {{ hasJlptAccess(level) ? '已开通' : '未开通' }}
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
      class="download-dialog"
    >
      <div class="download-options">
        <a href="/downloads/chunshua.apk" class="download-btn android">
          <i class="ri-android-line"></i>
          Android版下载
        </a>
        <a href="https://apps.apple.com/app/chunshua" target="_blank" class="download-btn ios">
          <i class="ri-apple-line"></i>
          iOS版下载
        </a>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDownloadDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Redeem Code Dialog -->
    <el-dialog
      v-model="showRedeemDialog"
      title="兑换VIP会员"
      width="360px"
      center
      :show-close="false"
      class="redeem-dialog"
    >
      <div class="redeem-form">
        <div class="form-group">
          <label>兑换码</label>
          <input 
            type="text" 
            v-model="redeemCode"
            placeholder="请输入兑换码"
            maxlength="8"
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRedeemDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleRedeem"
            :loading="isRedeeming"
          >
            {{ isRedeeming ? '兑换中...' : '确认兑换' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { API_ENDPOINTS } from '../config/api'

const router = useRouter()
const authStore = useAuthStore()
const showPurchaseDialog = ref(false)
const showDownloadDialog = ref(false)
const showRedeemDialog = ref(false)
const redeemCode = ref('')
const isRedeeming = ref(false)

const userRole = computed(() => {
  return authStore.userInfo?.userRole === 0 ? '普通用户' : '教师'
})

const maskedPhone = computed(() => {
  const phone = authStore.userInfo?.userAccount || ''
  if (phone.length >= 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return phone
})

const maskedEmail = computed(() => {
  const email = authStore.userInfo?.email
  if (!email) return '未设置'
  const [username, domain] = email.split('@')
  if (username.length <= 4) return email
  return `${username.slice(0, 2)}****${username.slice(-2)}@${domain}`
})

const hasJlptAccess = (level: string) => {
  const key = `japanese${level}` as keyof typeof authStore.userInfo
  return authStore.userInfo?.[key] === 1
}

const navigateToEdit = () => {
  router.push('/profile/edit')
}

const handleLevelClick = (level: string) => {
  if (!hasJlptAccess(level)) {
    showPurchaseDialog.value = true
  }
}

// VIP状态相关方法
const getMainStatusClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) return 'not-vip'
  if (isPaid === 1) return 'beta-user'
  return 'vip-user'
}

const getMainStatusText = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) return '未开通VIP'
  if (isPaid === 1) return '内测用户'
  return 'VIP用户'
}

const getAudioFeatureClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  return isPaid >= 2 ? 'feature-active' : 'feature-inactive'
}

const getVideoFeatureClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  return isPaid >= 3 ? 'feature-active' : 'feature-inactive'
}

const getCourseFeatureClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  return isPaid >= 4 ? 'feature-active' : 'feature-inactive'
}

const getDescriptionText = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 1) {
    return '内测用户已解锁所有单词、语法及练习的学习权限。'
  }
  return '开通VIP可解锁所有单词、语法及练习的学习权限，请联系客服购买。'
}

const handleMainStatusClick = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) {
    showPurchaseDialog.value = true
  }
}

const handleFeatureClick = (feature: string) => {
  const isPaid = authStore.userInfo?.isPaid || 0
  
  // 根据不同状态判断是否需要弹出客服对话框
  if (isPaid === 0) {
    // 未开通VIP，所有功能都弹出客服对话框
    showPurchaseDialog.value = true
  } else if (isPaid === 1) {
    // 内测用户，所有功能都弹出客服对话框
    showPurchaseDialog.value = true
  } else if (isPaid === 2) {
    // VIP用户，视频讲解和课程学习功能弹出客服对话框
    if (feature === 'video' || feature === 'course') {
      showPurchaseDialog.value = true
    }
  } else if (isPaid === 3) {
    // VIP用户，只有课程学习功能弹出客服对话框
    if (feature === 'course') {
      showPurchaseDialog.value = true
    }
  }
  // isPaid === 4 时，所有功能都已开通，不需要弹出对话框
}

const downloadApp = () => {
  showPurchaseDialog.value = false
  showDownloadDialog.value = true
}

const handleRedeem = async () => {
  if (!redeemCode.value) {
    ElMessage.error('请输入兑换码')
    return
  }

  isRedeeming.value = true

  try {
    const response = await fetch(API_ENDPOINTS.user.redeemCodePC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: authStore.userInfo?.userId,
        token: authStore.token,
        phone_number: authStore.phoneNumber?.replace(/^\+/, ''),
        redeemCode: redeemCode.value,
        loginType: 2
      })
    })

    const data = await response.json()

    if (data.code !== 200) {
      throw new Error(data.msg || '兑换失败')
    }
    
    // 更新用户信息状态
    if (data.data && authStore.userInfo) {
      // 更新 userInfo 中的相关字段
      authStore.userInfo.isActive = data.data.isActive
      authStore.userInfo.isPaid = data.data.isPaid
      authStore.userInfo.japaneseN1 = data.data.japaneseN1
      authStore.userInfo.japaneseN2 = data.data.japaneseN2
      authStore.userInfo.japaneseN3 = data.data.japaneseN3
      authStore.userInfo.japaneseN4 = data.data.japaneseN4
      authStore.userInfo.japaneseN5 = data.data.japaneseN5
      
      // 更新 auth store 中的其他状态
      authStore.isActive = data.data.isActive
      authStore.isPaid = data.data.isPaid
      
      // 更新权限状态
      authStore.permissions = {
        N5: !!data.data.japaneseN5,
        N4: !!data.data.japaneseN4,
        N3: !!data.data.japaneseN3,
        N2: !!data.data.japaneseN2,
        N1: !!data.data.japaneseN1
      }
      
      // 更新 localStorage 中的状态以保持持久化
      const savedState = localStorage.getItem('authState')
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          state.userInfo = authStore.userInfo
          state.isActive = authStore.isActive
          state.isPaid = authStore.isPaid
          localStorage.setItem('authState', JSON.stringify(state))
        } catch (error) {
          console.error('Failed to update localStorage:', error)
        }
      }
    }
    
    // Show success message
    ElMessage.success('兑换成功！权限已更新')
    showRedeemDialog.value = false
    redeemCode.value = ''

  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '兑换失败，请稍后重试')
  } finally {
    isRedeeming.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: var(--spacing-xl) 0;
  background-color: var(--background-color);
  min-height: calc(100vh - 60px);
}

.profile-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.profile-info {
  .profile-details {
    h1 {
      font-size: 1.8rem;
      margin-bottom: 5px;
    }
    
    .user-role {
      opacity: 0.9;
      font-size: 1.1rem;
    }
  }
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  
  // 手机模式下折行显示
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
}

.btn-edit,
.btn-redeem {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  // 手机模式下按钮样式调整
  @media (max-width: 768px) {
    justify-content: center;
    padding: 12px 16px;
    font-size: 0.95rem;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

// 同时调整profile-header在手机模式下的布局
.profile-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  
  // 手机模式下垂直布局
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    
    .profile-info {
      width: 100%;
    }
    
    .header-actions {
      width: 100%;
    }
  }
}

.info-section {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    i {
      font-size: 1.4rem;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  label {
    display: block;
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: var(--spacing-xs);
  }
  
  span {
    font-size: 1.1rem;
  }
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  
  &.active {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
  }
  
  &.inactive {
    background-color: rgba(231, 76, 60, 0.1);
    color: var(--error-color);
  }
}

.jlpt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.jlpt-item {
  background-color: var(--background-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--transition-fast);
  
  &.not-activated {
    cursor: pointer;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
      transform: translateY(-2px);
    }
  }
  
  .level-badge {
    background-color: var(--primary-color);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .access-status {
    font-size: 0.9rem;
    
    &.has-access {
      color: var(--success-color);
    }
    
    &.no-access {
      color: var(--text-light);
    }
  }
}

.vip-status-container {
  width: 100%;
}

.main-status {
  margin-bottom: var(--spacing-md);
}

.main-badge {
  font-size: 1.1rem;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.not-vip {
    background-color: rgba(231, 76, 60, 0.1);
    color: var(--error-color);
    border: 2px solid var(--error-color);
    
    &:hover {
      background-color: rgba(231, 76, 60, 0.2);
      transform: translateY(-1px);
    }
  }
  
  &.beta-user {
    background-color: rgba(245, 166, 35, 0.1);
    color: var(--accent-color);
    border: 2px solid var(--accent-color);
  }
  
  &.vip-user {
    background-color: rgba(255, 215, 0, 0.1);
    color: #DAA520;
    border: 2px solid #DAA520;
  }
}

.vip-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  
  i {
    font-size: 1rem;
  }
  
  &.feature-active {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
    border-color: var(--success-color);
  }
  
  &.feature-inactive {
    background-color: rgba(153, 153, 153, 0.1);
    color: var(--text-muted);
    border-color: var(--text-muted);
    
    &:hover {
      background-color: rgba(153, 153, 153, 0.2);
      transform: translateY(-1px);
    }
  }
}

.vip-description {
  margin-top: var(--spacing-sm);
  
  p {
    color: var(--text-light);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
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

.redeem-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .redeem-form {
    padding: var(--spacing-md) 0;

    .form-group {
      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--text-light);
      }

      input {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
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