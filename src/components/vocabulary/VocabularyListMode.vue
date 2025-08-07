<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VocabularyList from './VocabularyList.vue'
import VideoDialog from './VideoDialog.vue'

const props = defineProps<{
  words: any[]
  currentLevel: string
  wordCount: string
}>()

const emit = defineEmits(['change-level', 'change-count', 'view-details', 'load-more'])

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 显示单词详情
const showWordDetails = (word: any) => {
  emit('view-details', word)
}

// 播放讲解视频
const playExplanationVideo = (word: any) => {
  // 在实际应用中，这里应该从word中获取视频URL
  if (word && word.explanationUrl) {
    explanationVideoUrl.value = word.explanationUrl
  } else {
    explanationVideoUrl.value = null
  }
  
  showVideoDialog.value = true
}

// 加载更多单词
const loadMoreWords = () => {
  emit('load-more')
}

// 停止所有音频
const stopAllAudio = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
})
</script>

<template>
  <div class="list-mode">
    <div class="vocabulary-list-container">
      <VocabularyList 
        :words="words" 
        @view-details="showWordDetails"
        @play-explanation-video="playExplanationVideo"
      />
    </div>
    
    <div class="load-more">
      <button class="btn-load-more" @click="loadMoreWords">
        <i class="ri-refresh-line"></i>
        再来一组单词
      </button>
    </div>
    
    <!-- 视频讲解弹窗 -->
    <VideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
  </div>
</template>

<style lang="scss" scoped>
.list-mode {
  width: 100%;
}

.vocabulary-list-container {
  margin-bottom: var(--spacing-xl);
}

.load-more {
  text-align: center;
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.btn-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  i {
    font-size: 1.2rem;
  }
}
</style>