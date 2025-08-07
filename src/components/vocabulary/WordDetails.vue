<template>
  <div class="word-details">
    <div class="details-header">
      <div :class="['level-badge', getLevelClass(word.level)]">{{ word.level }}</div>
    </div>
    
    <div class="details-content">
      <div class="word-section">
        <h3 class="kanji">{{ word.kanji }}</h3>
        <p class="kana">{{ word.kana }}</p>
        <div class="word-actions">
          <button class="sound-btn" @click="playPronunciation">
            <i class="ri-volume-up-line"></i>
            发音
          </button>
          <button v-if="showVideoButton" class="video-btn" @click="playExplanationVideo">
            <i class="ri-video-line"></i>
            讲解视频
          </button>
        </div>
      </div>
      
      <div class="meaning-section">
        <h4>含义</h4>
        <p>{{ word.meaning }}</p>
      </div>
      
      <div class="examples-section" v-if="hasExamples">
        <h4>例句</h4>
        <div class="example" v-if="word.example">
          <p class="jp-text">{{ word.example }}</p>
          <p class="example-meaning">{{ word.exampleMeaning }}</p>
          <div class="example-actions">
            <button class="example-sound-btn" @click="playExamplePronunciation(word.example)">
              <i class="ri-volume-up-line"></i>
              朗读例句
            </button>
          </div>
        </div>
        
        <div class="example" v-if="word.example2">
          <p class="jp-text">{{ word.example2 }}</p>
          <p class="example-meaning">{{ word.exampleMeaning2 }}</p>
          <div class="example-actions">
            <button class="example-sound-btn" @click="playExamplePronunciation(word.example2)">
              <i class="ri-volume-up-line"></i>
              朗读例句
            </button>
          </div>
        </div>
        
        <div class="example" v-if="word.example3">
          <p class="jp-text">{{ word.example3 }}</p>
          <p class="example-meaning">{{ word.exampleMeaning3 }}</p>
          <div class="example-actions">
            <button class="example-sound-btn" @click="playExamplePronunciation(word.example3)">
              <i class="ri-volume-up-line"></i>
              朗读例句
            </button>
          </div>
        </div>
      </div>
      
      <div class="tags-section" v-if="word.tags && word.tags.length > 0">
        <h4>标签</h4>
        <div class="tags">
          <span v-for="(tag, index) in word.tags" :key="index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 音频权限弹窗 -->
  <teleport to="body">
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
  </teleport>
  
  <!-- 视频权限弹窗 -->
  <teleport to="body">
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
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio, playExampleAudio, stopAllAudio } from '../../utils/audio'

interface WordDetail {
  id: string
  kanji: string
  kana: string
  meaning: string
  example?: string
  exampleMeaning?: string
  example2?: string
  exampleMeaning2?: string
  example3?: string
  exampleMeaning3?: string
  level: string
  tags?: string[]
  explanationUrl?: string
  wordAudioUrl?: string
  wordSpeakVideoUrl?: string
}

const props = defineProps<{
  word: WordDetail
}>()

const emit = defineEmits(['play-explanation-video'])

const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)

const hasExamples = computed(() => {
  return props.word.example || props.word.example2 || props.word.example3
})

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

// 检查是否显示视频按钮
const showVideoButton = computed(() => {
  return props.word.wordSpeakVideoUrl && props.word.wordSpeakVideoUrl.trim() !== '' && props.word.wordSpeakVideoUrl !== 'null'
})

// 播放讲解视频
const playExplanationVideo = () => {
  // 检查视频权限
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  emit('play-explanation-video', props.word)
}

const playPronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  playWordAudio(
    props.word.wordAudioUrl,
    () => {},
    () => {},
    () => {}
  )
}

const playExamplePronunciation = (example: string | undefined) => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  // 确定例句索引
  let exampleIndex = 0
  if (example === props.word.example2) {
    exampleIndex = 1
  } else if (example === props.word.example3) {
    exampleIndex = 2
  }
  
  playExampleAudio(
    props.word.wordAudioUrl,
    exampleIndex,
    () => {},
    () => {},
    () => {}
  )
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
})
</script>

<style lang="scss" scoped>
.word-details {
  display: flex;
  flex-direction: column;
}

.details-header {
  margin-bottom: var(--spacing-md);
  
  .level-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    
    &.level-n5 { 
      background-color: #4CAF50;
    }
    &.level-n4 { 
      background-color: #2196F3;
    }
    &.level-n3 { 
      background-color: #FF9800;
    }
    &.level-n2 { 
      background-color: #F44336;
    }
    &.level-n1 { 
      background-color: #9C27B0;
    }
  }
}

.details-content {
  flex: 1;
}

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
    gap: var(--spacing-sm);
  }
  
  .sound-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background-color: #e3f2fd;
    color: #1976d2;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background-color: #bbdefb;
    }
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .video-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background-color: #fff3e0;
    color: #ff9800;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background-color: #ffe0b2;
      transform: translateY(-2px);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}

.meaning-section,
.examples-section,
.tags-section {
  margin-bottom: var(--spacing-lg);
  
  h4 {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 5px;
  }
}

.example {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: #f5f9ff;
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .jp-text {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  
  .example-meaning {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 8px;
  }
  
  .example-actions {
    display: flex;
    gap: var(--spacing-sm);
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: rgba(74, 144, 226, 0.1);
  color: var(--primary-color);
  font-size: 0.9rem;
  padding: 4px 10px;
  border-radius: 20px;
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