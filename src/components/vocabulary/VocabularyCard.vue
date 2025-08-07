<script setup lang="ts">
import { ref, computed } from 'vue'
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
    example2Meaning?: string
    example3?: string
    example3Meaning?: string
    level: string
    tags?: string[]
    wordAudioUrl?: string
    wordSpeakVideoUrl?: string
  }
}>()

const emit = defineEmits(['play-explanation-video'])

const isFlipped = ref(false)
const currentExampleIndex = ref(0)
const isPlaying = ref(false)
const isExamplePlaying = ref(false)

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const playPronunciation = (event: Event) => {
  event.stopPropagation()
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  playWordAudio(
    props.word.wordAudioUrl,
    () => { isPlaying.value = true },
    () => { isPlaying.value = false },
    () => { isPlaying.value = false }
  )
}

const playExamplePronunciation = (event: Event) => {
  event.stopPropagation()
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  playExampleAudio(
    props.word.wordAudioUrl,
    currentExampleIndex.value,
    () => { isExamplePlaying.value = true },
    () => { isExamplePlaying.value = false },
    () => { isExamplePlaying.value = false }
  )
}

const playExplanationVideo = (event: Event) => {
  event.stopPropagation()
  
  if (!props.word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(props.word.wordSpeakVideoUrl)
  if (videoUrl) {
    emit('play-explanation-video', { ...props.word, explanationUrl: videoUrl })
  }
}

// 计算是否显示视频按钮
const showVideoButton = computed(() => {
  return props.word.wordSpeakVideoUrl && props.word.wordSpeakVideoUrl.trim() !== ''
})

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

const currentExample = computed(() => {
  switch (currentExampleIndex.value) {
    case 0:
      return {
        text: props.word.example,
        meaning: props.word.exampleMeaning
      }
    case 1:
      return {
        text: props.word.example2,
        meaning: props.word.example2Meaning
      }
    case 2:
      return {
        text: props.word.example3,
        meaning: props.word.example3Meaning
      }
    default:
      return {
        text: '',
        meaning: ''
      }
  }
})

const hasExample = computed(() => {
  return props.word.example || props.word.example2 || props.word.example3
})

const setExample = (index: number, event: Event) => {
  event.stopPropagation()
  currentExampleIndex.value = index
}
</script>

<template>
  <div :class="['word-card', { 'is-flipped': isFlipped }]" @click="toggleFlip">
    <div class="card-inner">
      <div class="card-front">
        <div :class="['level-badge', levelClass]">{{ word.level }}</div>
        <div class="sound-btn" @click="playPronunciation">
          <i :class="isPlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
        </div>
        
        <div class="card-content">
          <h3 class="kanji">{{ word.kanji }}</h3>
          <p class="kana">{{ word.kana }}</p>
          <p class="meaning">{{ word.meaning }}</p>
          
          <div class="card-action">
            <p class="card-hint">点击查看例句</p>
          </div>
        </div>
      </div>
      
      <div class="card-back">
        <div :class="['level-badge', levelClass]">{{ word.level }}</div>
        <div class="sound-btn" @click="playPronunciation">
          <i :class="isPlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
        </div>
        
        <div class="card-content">
          <div class="word-info">
            <h3 class="kanji">{{ word.kanji }}</h3>
            <p class="kana">{{ word.kana }}</p>
          </div>
          
          <div class="examples" v-if="hasExample">
            <div class="example" v-if="currentExample.text">
              <p class="jp-text">{{ currentExample.text }}</p>
              <p v-if="currentExample.meaning" class="example-meaning">{{ currentExample.meaning }}</p>
              <div class="example-actions">
                <button class="example-sound-btn" @click="playExamplePronunciation">
                  <i :class="isExamplePlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
                  朗读例句
                </button>
                <button v-if="showVideoButton" class="example-video-btn" @click="playExplanationVideo">
                  <i class="ri-video-line"></i>
                  讲解视频
                </button>
              </div>
            </div>
            
            <div class="example-tabs">
              <button 
                v-if="word.example"
                :class="['tab-btn', { active: currentExampleIndex === 0 }]"
                @click="setExample(0, $event)"
              >
                例句1
              </button>
              <button 
                v-if="word.example2"
                :class="['tab-btn', { active: currentExampleIndex === 1 }]"
                @click="setExample(1, $event)"
              >
                例句2
              </button>
              <button 
                v-if="word.example3"
                :class="['tab-btn', { active: currentExampleIndex === 2 }]"
                @click="setExample(2, $event)"
              >
                例句3
              </button>
            </div>
          </div>
          
          <div class="tags" v-if="word.tags && word.tags.length > 0">
            <span v-for="(tag, index) in word.tags" :key="index" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
.word-card {
  perspective: 1000px;
  height: 280px;
  cursor: pointer;
  user-select: none;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--primary-color);
  }
}

.card-back {
  transform: rotateY(180deg);
  overflow-y: auto;
}

.level-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
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

.sound-btn {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
  i {
    font-size: 1.1rem;
    color: var(--primary-color);
    transition: all var(--transition-fast);
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: var(--spacing-xl);
  padding: 0 var(--spacing-sm);
  position: relative;
  z-index: 0;
}

.word-info {
  margin-bottom: var(--spacing-md);
}

.kanji {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  text-align: center;
  color: var(--primary-color);
  
  .card-front & {
    margin-top: var(--spacing-lg);
    font-size: 3rem;
  }
}

.kana {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.meaning {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  text-align: center;
  line-height: 1.4;
}

.card-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: auto;
  text-align: center;
  padding: 8px;
  background-color: rgba(74, 144, 226, 0.05);
  border-radius: 20px;
  animation: pulse 2s infinite;
}

.examples {
  margin-bottom: var(--spacing-md);
  flex: 1;
}

.example {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: rgba(74, 144, 226, 0.05);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);

  .jp-text {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 4px;
    word-break: break-all;
  }

  .example-meaning {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: 8px;
  }
  
  .example-sound-btn {
    display: flex;
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

.example-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.tab-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: none;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);

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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.tag {
  background-color: rgba(74, 144, 226, 0.1);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 12px;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>