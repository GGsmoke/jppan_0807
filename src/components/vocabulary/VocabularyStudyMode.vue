<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VocabularyReview from './VocabularyReview.vue'
import VideoDialog from './VideoDialog.vue'

const props = defineProps<{
  words: any[]
}>()

const emit = defineEmits(['view-details'])

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 播放讲解视频
const playExplanationVideo = (word: any) => {
  // 先关闭当前视频对话框
  if (showVideoDialog.value) {
    showVideoDialog.value = false
    setTimeout(() => {
      if (word && word.explanationUrl) {
        explanationVideoUrl.value = word.explanationUrl
      } else {
        explanationVideoUrl.value = null
      }
      showVideoDialog.value = true
    }, 100)
  } else {
    if (word && word.explanationUrl) {
      explanationVideoUrl.value = word.explanationUrl
    } else {
      explanationVideoUrl.value = null
    }
    showVideoDialog.value = true
  }
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
  <div class="study-mode">
    <div class="cards-container">
      <VocabularyReview 
        :words="props.words"
        @play-explanation-video="playExplanationVideo"
      />
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
.study-mode {
  width: 100%;
  
  .cards-container {
    display: block;
    width: 100%;
  }
}
</style>