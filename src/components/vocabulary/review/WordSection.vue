<template>
  <div class="word-section">
    <h3 class="kanji">{{ currentWord.kanji }}</h3>
    <p class="kana">{{ currentWord.kana }}</p>
    <div class="word-actions">
      <button class="btn-sound" @click="handlePlayPronunciation">
        <i class="ri-volume-up-line"></i>
        发音
      </button>
      <button v-if="showVideoButton" class="btn-explanation" @click="handlePlayExplanationVideo">
        <i class="ri-video-line"></i>
        讲解视频
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
  
  <!-- 视频权限弹窗 -->
  <el-dialog
    v-model="showVideoPermissionDialog"
    title="开通视频权限"
    width="360px"
    center
    :show-close="false"
    class="video-permission-dialog"
  >
    <div class="qr-container">
      <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服二维码" class="qr-code">
      <p>扫码添加客服微信</p>
      <p class="tip">需要用户购买讲解视频播放权限</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showVideoPermissionDialog = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'

const props = defineProps<{
  currentWord: {
    kanji: string
    kana: string
    wordSpeakVideoUrl?: string
  }
}>()

const emit = defineEmits(['play-pronunciation', 'play-explanation-video'])
const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)

// 检查是否显示视频按钮
const showVideoButton = computed(() => {
  return props.currentWord.wordSpeakVideoUrl && 
         props.currentWord.wordSpeakVideoUrl.trim() !== '' && 
         props.currentWord.wordSpeakVideoUrl !== 'null'
})

const handlePlayPronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  emit('play-pronunciation')
}

const handlePlayExplanationVideo = () => {
  // 检查视频权限
  if ((authStore.userInfo?.isPaid || 0) < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  emit('play-explanation-video')
}
</script>

<style lang="scss" scoped>
.word-section {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  .kanji {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
  
  .kana {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: var(--spacing-sm);
  }
  
  .word-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
  }
  
  .btn-sound,
  .btn-explanation {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: all var(--transition-fast);
    margin: 0 var(--spacing-xs);
    border: none;
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .btn-sound {
    background-color: #e3f2fd;
    color: #1976d2;
    
    &:hover {
      background-color: #bbdefb;
      transform: translateY(-2px);
    }
  }
  
  .btn-explanation {
    background-color: #fff3e0;
    color: #ff9800;
    
    &:hover {
      background-color: #ffe0b2;
      transform: translateY(-2px);
    }
  }
}

.audio-permission-dialog,
.video-permission-dialog {
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