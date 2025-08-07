<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  currentTab: string
  tabs: { id: string; name: string; icon: string }[]
}>()

const emit = defineEmits(['switch-tab'])
const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)

// 检查是否需要VIP权限的标签页
const needsVipAccess = (tabId: string) => {
  return ['study', 'test', 'listening'].includes(tabId)
}

// 检查用户是否有音频VIP权限
const hasAudioVip = computed(() => {
  return (authStore.userInfo?.isPaid || 0) >= 2
})

const switchTab = (tabId: string) => {
  // 检查是否需要VIP权限
  if (needsVipAccess(tabId)) {
    // 检查音频权限 - 修正条件判断
    if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid < 2) {
      showAudioPermissionDialog.value = true
      return
    }
  }
  
  emit('switch-tab', tabId)
}
</script>

<template>
  <div class="mode-tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="['tab-btn', { active: currentTab === tab.id }]"
      @click="switchTab(tab.id)"
    >
      <i :class="tab.icon"></i>
      <span class="tab-text">{{ tab.name }}</span>
      <span v-if="needsVipAccess(tab.id)" class="vip-badge">
        <i class="ri-vip-crown-line"></i>
        VIP
      </span>
    </button>
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
      <p class="tip">需要用户购买音频播放权限</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showAudioPermissionDialog = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>

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

.mode-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  
  // 移动端样式优化
  @media (max-width: 768px) {
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    
    // 第一行：单词列表和学习时刻
    .tab-btn:nth-child(1),
    .tab-btn:nth-child(2) {
      flex: 1;
      min-width: calc(50% - var(--spacing-sm) / 2);
      margin-bottom: var(--spacing-sm);
    }
    
    // 第二行：单词记忆练习和听力练习在一行
    .tab-btn:nth-child(3),
    .tab-btn:nth-child(4) {
      flex: 1;
      min-width: calc(50% - var(--spacing-sm) / 2);
    }
  }
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  background-color: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  font-weight: 500;
  position: relative;

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
  
  .tab-text {
    margin-right: 4px;
  }
  
  .vip-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background-color: #FFD700;
    color: #B8860B;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    
    i {
      font-size: 0.8rem;
    }
  }
  
  &.active .vip-badge {
    background-color: rgba(255, 215, 0, 0.2);
    color: white;
  }
  
  // 移动端按钮样式优化
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.9rem;
    justify-content: center;
    text-align: center;
    
    i {
      font-size: 1rem;
    }
    
    .tab-text {
      margin-right: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .vip-badge {
      font-size: 0.6rem;
      padding: 1px 4px;
      
      i {
        font-size: 0.7rem;
      }
    }
    
    // 悬停效果在移动端禁用
    &:hover {
      transform: none;
      box-shadow: var(--shadow-sm);
    }
    
    // 激活状态在移动端的特殊样式
    &.active {
      box-shadow: var(--shadow-md);
    }
  }
  
  // 超小屏幕优化
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 0.85rem;
    gap: 6px;
    
    i {
      font-size: 0.9rem;
    }
    
    .tab-text {
      font-size: 0.85rem;
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