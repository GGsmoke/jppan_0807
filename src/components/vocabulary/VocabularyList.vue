<template>
  <div class="vocabulary-list">
    <!-- 桌面端保持原有表格布局 -->
    <div class="desktop-layout">
      <div class="list-header">
        <div class="header-cell kanji-cell">单词</div>
        <div class="header-cell kana-cell">假名</div>
        <div class="header-cell meaning-cell">含义</div>
        <div class="header-cell level-cell">等级</div>
        <div class="header-cell actions-cell">操作</div>
      </div>
      
      <div class="list-body">
        <div 
          v-for="word in words" 
          :key="word.id"
          class="list-row"
        >
          <div class="list-cell kanji-cell">
            <span class="kanji">{{ word.kanji }}</span>
          </div>
          <div class="list-cell kana-cell">{{ word.kana }}</div>
          <div class="list-cell meaning-cell">{{ word.meaning }}</div>
          <div class="list-cell level-cell">
            <span :class="['level-badge', getLevelClass(word.level)]">{{ word.level }}</span>
          </div>
          <div class="list-cell actions-cell">
            <button class="action-btn view-btn" @click="viewDetails(word)">
              <i class="ri-eye-line"></i>
            </button>
            <button v-if="shouldShowAudioButton(word)" class="action-btn sound-btn" @click="playPronunciation(word)">
              <i :class="playingWord === word.id ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            </button>
            <button v-if="shouldShowVideoButton(word)" class="action-btn video-btn" @click="playExplanationVideo(word)">
              <i class="ri-video-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端卡片布局 -->
    <div class="mobile-layout">
      <div 
        v-for="word in words" 
        :key="word.id"
        class="word-card"
      >
        <!-- 主要信息区域 -->
        <div class="word-main">
          <div class="word-header">
            <div class="word-kanji">
              <span class="kanji-text">{{ word.kanji }}</span>
              <span :class="['level-badge', getLevelClass(word.level)]">{{ word.level }}</span>
            </div>
            <div class="word-actions">
              <button class="action-btn view-btn" @click="viewDetails(word)">
                <i class="ri-eye-line"></i>
              </button>
              <button v-if="shouldShowAudioButton(word)" class="action-btn sound-btn" @click="playPronunciation(word)">
                <i :class="playingWord === word.id ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
              </button>
              <button v-if="shouldShowVideoButton(word)" class="action-btn video-btn" @click="playExplanationVideo(word)">
                <i class="ri-video-line"></i>
              </button>
            </div>
          </div>
          
          <div class="word-kana">
            <span class="label">假名：</span>
            <span class="kana-text">{{ word.kana }}</span>
          </div>
          
          <div class="word-meaning">
            <span class="label">含义：</span>
            <div class="meaning-content">
              <span 
                :class="['meaning-text', { 'expanded': expandedWords.has(word.id) }]"
                @click="toggleExpand(word.id)"
              >
                {{ word.meaning }}
              </span>
              <button 
                v-if="isMeaningLong(word.meaning)"
                class="expand-btn"
                @click="toggleExpand(word.id)"
              >
                {{ expandedWords.has(word.id) ? '收起' : '展开' }}
              </button>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio } from '../../utils/audio'
import { getVideoUrl } from '../../utils/crypto'

interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  level: string
  tags?: string[]
  explanationUrl?: string
  example?: string
  exampleMeaning?: string
  example2?: string
  example2Meaning?: string
  example3?: string
  example3Meaning?: string
  wordAudioUrl?: string
  wordSpeakVideoUrl?: string
}

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits(['view-details', 'play-explanation-video'])

const authStore = useAuthStore()
const playingWord = ref<string | null>(null)
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const isAnyAudioPlaying = ref(false)

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

const viewDetails = (word: Word) => {
  emit('view-details', word)
}

const playPronunciation = (word: Word) => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 如果有其他音频在播放，则不允许播放
  if (isAnyAudioPlaying.value) {
    return
  }
  
  if (!word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  playWordAudio(
    word.wordAudioUrl,
    () => { 
      playingWord.value = word.id
      isAnyAudioPlaying.value = true
    },
    () => { 
      playingWord.value = null
      isAnyAudioPlaying.value = false
    },
    () => { 
      playingWord.value = null
      isAnyAudioPlaying.value = false
    }
  )
}

const playExplanationVideo = (word: Word) => {
  // 检查视频权限
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(word.wordSpeakVideoUrl)
  if (videoUrl) {
    emit('play-explanation-video', { ...word, explanationUrl: videoUrl })
  }
}

// 检查是否显示视频按钮
const shouldShowVideoButton = (word: Word) => {
  return word.wordSpeakVideoUrl && 
         word.wordSpeakVideoUrl.trim() !== '' && 
         word.wordSpeakVideoUrl !== 'null' && 
         word.wordSpeakVideoUrl !== null
}

// 检查是否显示音频按钮
const shouldShowAudioButton = (word: Word) => {
  return word.wordAudioUrl && word.wordAudioUrl.trim() !== ''
}

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
  playingWord.value = null
  isAnyAudioPlaying.value = false
}

// 新增：展开状态管理
const expandedWords = ref(new Set<string>())

// 新增：判断含义是否过长
const isMeaningLong = (meaning: string) => {
  return meaning.length > 30 // 可根据需要调整字符数限制
}

// 新增：切换展开状态
const toggleExpand = (wordId: string) => {
  if (expandedWords.value.has(wordId)) {
    expandedWords.value.delete(wordId)
  } else {
    expandedWords.value.add(wordId)
  }
}
</script>

<style lang="scss" scoped>
.vocabulary-list {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 桌面端布局（保持原有样式）
.desktop-layout {
  display: block;
  
  .list-header {
    display: flex;
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
    padding: 12px 16px;
  }
  
  .list-body {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .list-row {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color var(--transition-fast);
    
    &:hover {
      background-color: #f5f9ff;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .header-cell,
  .list-cell {
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }
  
  .kanji-cell {
    width: 20%;
    font-weight: 500;
    
    .kanji {
      font-size: 1.2rem;
      color: var(--primary-color);
    }
  }
  
  .kana-cell {
    width: 20%;
  }
  
  .meaning-cell {
    width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .level-cell {
    width: 10%;
  }
  
  .actions-cell {
    width: 20%;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

// 移动端卡片布局
.mobile-layout {
  display: none;
  padding: 12px;
  
  .word-card {
    background: white;
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .word-kanji {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    
    .kanji-text {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--primary-color);
      line-height: 1.2;
    }
  }
  
  .word-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  
  .word-kana {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .label {
      font-size: 0.85rem;
      color: #666;
      margin-right: 6px;
      flex-shrink: 0;
    }
    
    .kana-text {
      font-size: 1rem;
      color: #333;
      font-weight: 500;
    }
  }
  
  .word-meaning {
    .label {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 4px;
      display: block;
    }
    
    .meaning-content {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    
    .meaning-text {
      flex: 1;
      font-size: 0.95rem;
      color: #333;
      line-height: 1.4;
      cursor: pointer;
      
      // 使用现代 CSS 实现多行文本截断
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3; // 现代标准属性
      -webkit-box-orient: vertical;
      box-orient: vertical; // 现代标准属性
      
      &.expanded {
        display: block;
        -webkit-line-clamp: unset;
        line-clamp: unset;
      }
    }
    
    .expand-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.8rem;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 通用样式
.level-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  color: white;
  font-weight: 500;
  
  &.level-n5 { background-color: #4CAF50; }
  &.level-n4 { background-color: #2196F3; }
  &.level-n3 { background-color: #FF9800; }
  &.level-n2 { background-color: #F44336; }
  &.level-n1 { background-color: #9C27B0; }
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  i {
    font-size: 0.9rem;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.view-btn {
    background-color: #e3f2fd;
    color: #1976d2;
    
    &:hover {
      background-color: #bbdefb;
    }
  }
  
  &.sound-btn {
    background-color: #e8f5e9;
    color: #43a047;
    
    &:hover {
      background-color: #c8e6c9;
    }
  }
  
  &.video-btn {
    background-color: #fff3e0;
    color: #ff9800;
    
    &:hover {
      background-color: #ffe0b2;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
}

@media (min-width: 769px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

// 保持原有的弹窗样式
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