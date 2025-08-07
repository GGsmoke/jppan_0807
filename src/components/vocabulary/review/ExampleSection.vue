<template>
  <div class="example-section" :class="{ 'revealed': exampleRevealed }">
    <button v-if="!exampleRevealed" class="btn-reveal" @click="handleRevealExample">
      <i class="ri-eye-line"></i>
      显示例句
    </button>
    <div v-else class="example">
      <p class="jp-text">{{ currentExample.text }}</p>
      <p class="example-meaning">{{ currentExample.meaning }}</p>
      <button class="example-sound-btn" @click="handlePlayExamplePronunciation">
        <i :class="isExamplePlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
        朗读例句
      </button>
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
import { ref } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const props = defineProps<{
  exampleRevealed: boolean
  currentExample: {
    text?: string
    meaning?: string
  }
  isExamplePlaying: boolean
}>()

const emit = defineEmits(['reveal-example', 'play-example-pronunciation'])
const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)

const handleRevealExample = () => {
  emit('reveal-example')
}

const handlePlayExamplePronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  emit('play-example-pronunciation')
}
</script>

<style lang="scss" scoped>
.example-section {
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
  
  .example {
    width: 100%;
    
    .jp-text {
      font-size: 1.2rem;
      margin-bottom: var(--spacing-sm);
    }
    
    .example-meaning {
      color: #666;
      font-size: 1rem;
      margin-bottom: var(--spacing-sm);
    }
    
    .example-sound-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.9rem;
      cursor: pointer;
      padding: 4px 0;
      
      &:hover {
        text-decoration: underline;
      }
      
      i {
        font-size: 1rem;
      }
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