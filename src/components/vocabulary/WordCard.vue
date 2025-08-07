<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio, playExampleAudio } from '../../utils/audio'
import { getVideoUrl } from '../../utils/crypto'

const props = defineProps<{
  word: {
    id: string
    kanji: string
    kana: string
    meaning: string
    example: string
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
  words: any[]
  currentIndex: number
}>()

const emit = defineEmits(['play-explanation-video', 'update:current-index'])

const authStore = useAuthStore()
const isPlaying = ref(false)
const isExamplePlaying = ref<number | null>(null)
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const isAnyAudioPlaying = ref(false)

const levelClass = computed(() => {
  switch (props.word.level) {
    case 'N5': return 'level-n5'
    case 'N4': return 'level-n4'
    case 'N3': return 'level-n3'
    case 'N2': return 'level-n2'
    case 'N1': return 'level-n1'
    default: return ''
  }
})

// 检查是否显示视频按钮
const showVideoButton = computed(() => {
  return props.word.wordSpeakVideoUrl && 
         props.word.wordSpeakVideoUrl.trim() !== '' && 
         props.word.wordSpeakVideoUrl !== 'null'
})

// 获取所有例句
const allExamples = computed(() => {
  const examples: Array<{ text: string; meaning?: string; index: number }> = []
  if (props.word.example) {
    examples.push({
      text: props.word.example,
      meaning: props.word.exampleMeaning,
      index: 0
    })
  }
  if (props.word.example2) {
    examples.push({
      text: props.word.example2,
      meaning: props.word.exampleMeaning2,
      index: 1
    })
  }
  if (props.word.example3) {
    examples.push({
      text: props.word.example3,
      meaning: props.word.exampleMeaning3,
      index: 2
    })
  }
  return examples
})

const playPronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 如果有其他音频在播放，则不允许播放
  if (isAnyAudioPlaying.value) {
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
    () => { 
      isPlaying.value = true
      isAnyAudioPlaying.value = true
    },
    () => { 
      isPlaying.value = false
      isAnyAudioPlaying.value = false
    },
    () => { 
      isPlaying.value = false
      isAnyAudioPlaying.value = false
    }
  )
}

const playExamplePronunciation = (exampleIndex: number) => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 如果有其他音频在播放，则不允许播放
  if (isAnyAudioPlaying.value) {
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  playExampleAudio(
    props.word.wordAudioUrl,
    exampleIndex,
    () => { 
      isExamplePlaying.value = exampleIndex
      isAnyAudioPlaying.value = true
    },
    () => { 
      isExamplePlaying.value = null
      isAnyAudioPlaying.value = false
    },
    () => { 
      isExamplePlaying.value = null
      isAnyAudioPlaying.value = false
    }
  )
}

const playExplanationVideo = () => {
  // 检查视频权限
  if ((authStore.userInfo?.isPaid || 0) < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(props.word.wordSpeakVideoUrl)
  if (videoUrl) {
    emit('play-explanation-video', { ...props.word, explanationUrl: videoUrl })
  }
}

// 上一个单词
const prevWord = () => {
  // 停止所有音频播放
  stopAllAudio()
  
  if (props.currentIndex > 0) {
    emit('update:current-index', props.currentIndex - 1)
  }
}

// 下一个单词
const nextWord = () => {
  // 停止所有音频播放
  stopAllAudio()
  
  if (props.currentIndex < props.words.length - 1) {
    emit('update:current-index', props.currentIndex + 1)
  }
}

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
  isPlaying.value = false
  isExamplePlaying.value = null
  isAnyAudioPlaying.value = false
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
})
</script>

<template>
  <div class="word-card-container">
    <!-- 导航栏 -->
    <div class="card-navigation">
      <button 
        class="nav-btn prev" 
        @click="prevWord" 
        :disabled="currentIndex === 0"
      >
        <i class="ri-arrow-left-line"></i>
        上一个
      </button>
      
      <div class="word-counter">
        <span class="current">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total">{{ words.length }}</span>
      </div>
      
      <button 
        class="nav-btn next" 
        @click="nextWord" 
        :disabled="currentIndex === words.length - 1"
      >
        下一个
        <i class="ri-arrow-right-line"></i>
      </button>
    </div>

    <!-- 主卡片内容 -->
    <div class="word-card">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div :class="['level-badge', levelClass]">{{ word.level }}</div>
        <div class="word-actions">
          <button class="action-btn sound-btn" @click="playPronunciation" :disabled="isPlaying">
            <i :class="isPlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            <span>{{ isPlaying ? '播放中...' : '单词发音' }}</span>
          </button>
          <button v-if="showVideoButton" class="action-btn video-btn" @click="playExplanationVideo">
            <i class="ri-video-line"></i>
            <span>讲解视频</span>
          </button>
        </div>
      </div>

      <!-- 单词主体 -->
      <div class="word-main">
        <div class="word-display">
          <h1 class="kanji">{{ word.kanji }}</h1>
          <p class="kana">{{ word.kana }}</p>
          <p class="meaning">{{ word.meaning }}</p>
        </div>

        <!-- 标签 -->
        <div class="tags-section" v-if="word.tags && word.tags.length > 0">
          <span v-for="(tag, index) in word.tags" :key="index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 例句部分 -->
      <div class="examples-section" v-if="allExamples.length > 0">
        <h3 class="section-title">
          <i class="ri-chat-quote-line"></i>
          例句
        </h3>
        
        <div class="examples-list">
          <div 
            v-for="example in allExamples" 
            :key="example.index"
            :disabled="isPlaying || isAnyAudioPlaying"
          >
            <div class="example-header">
              <span class="example-number">例句 {{ example.index + 1 }}</span>
              <button 
                class="example-play-btn" 
                @click="playExamplePronunciation(example.index)"
                :disabled="isExamplePlaying === example.index || isAnyAudioPlaying"
              >
                <i :class="isExamplePlaying === example.index ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
                {{ isExamplePlaying === example.index ? '播放中' : '朗读' }}
              </button>
            </div>
            
            <div class="example-content">
              <p class="jp-text">{{ example.text }}</p>
              <p class="cn-text" v-if="example.meaning">{{ example.meaning }}</p>
            </div>
          </div>
        </div>
      </div>
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

<style lang="scss" scoped>
.word-card-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  i {
    font-size: 1.1rem;
  }
}

.word-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  
  .current {
    font-size: 1.3rem;
    color: var(--primary-dark);
  }
  
  .separator {
    color: var(--text-light);
    margin: 0 4px;
  }
  
  .total {
    color: var(--text-light);
  }
}

.word-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 0;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
}

.level-badge {
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &.level-n5 { 
    background: linear-gradient(135deg, #4CAF50, #45a049);
  }
  &.level-n4 { 
    background: linear-gradient(135deg, #2196F3, #1976d2);
  }
  &.level-n3 { 
    background: linear-gradient(135deg, #FF9800, #f57c00);
  }
  &.level-n2 { 
    background: linear-gradient(135deg, #F44336, #d32f2f);
  }
  &.level-n1 { 
    background: linear-gradient(135deg, #9C27B0, #7b1fa2);
  }
}

.word-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 1.1rem;
  }
}

.sound-btn {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  border: 2px solid #e3f2fd;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #bbdefb, #90caf9);
    border-color: #2196f3;
  }
}

.video-btn {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #f57c00;
  border: 2px solid #fff3e0;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffe0b2, #ffcc80);
    border-color: #ff9800;
  }
}

.word-main {
  padding: 32px 24px;
  text-align: center;
  background: linear-gradient(180deg, white 0%, #f8faff 100%);
}

.word-display {
  margin-bottom: 24px;
  
  .kanji {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }
  
  .kana {
    font-size: 1.8rem;
    color: var(--text-light);
    margin-bottom: 16px;
    font-weight: 400;
    letter-spacing: 2px;
  }
  
  .meaning {
    font-size: 1.4rem;
    color: var(--text-color);
    line-height: 1.6;
    font-weight: 500;
    max-width: 400px;
    margin: 0 auto;
  }
}

.tags-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.tag {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(74, 144, 226, 0.2));
  color: var(--primary-color);
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(74, 144, 226, 0.3);
  font-weight: 500;
}

.examples-section {
  padding: 24px;
  background: #f8faff;
  border-top: 1px solid rgba(74, 144, 226, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 20px;
  
  i {
    font-size: 1.4rem;
  }
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(74, 144, 226, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border-color: rgba(74, 144, 226, 0.2);
  }
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.example-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(74, 144, 226, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.example-play-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 1rem;
  }
}

.example-content {
  .jp-text {
    font-size: 1.2rem;
    line-height: 1.8;
    margin-bottom: 8px;
    color: var(--text-color);
    font-weight: 500;
  }
  
  .cn-text {
    font-size: 1rem;
    color: var(--text-light);
    line-height: 1.6;
  }
}

.card-footer {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  text-align: center;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(245, 166, 35, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 166, 35, 0.4);
  }
  
  i {
    font-size: 1.2rem;
  }
}

/* 权限弹窗样式 */
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
      border-radius: 12px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .word-display .kanji {
    font-size: 3rem;
  }
  
  .word-display .kana {
    font-size: 1.4rem;
  }
  
  .word-display .meaning {
    font-size: 1.2rem;
  }
  
  .card-navigation {
    padding: 16px 20px;
  }
  
  .nav-btn {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .word-main {
    padding: 24px 20px;
  }
  
  .examples-section {
    padding: 20px;
  }
  
  .example-item {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .word-display .kanji {
    font-size: 2.5rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .word-actions {
    width: 100%;
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>