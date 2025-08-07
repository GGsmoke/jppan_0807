<template>
  <div class="question-group" :class="{ active: isActive }">
    <!-- 组合题阅读材料 -->
    <div v-if="hasGroupStem" class="group-stem-container">
      <div v-if="group[0].questionStemImage" class="reading-image-container">
        <img 
          :src="group[0].questionStemImage" 
          alt="阅读材料" 
          class="reading-image"
          @load="handleImageLoad"
          @error="handleImageError"
          @click="openImageModal"
        >
        <div class="image-zoom-hint">点击图片放大查看</div>
      </div>
      
      <p class="group-stem-description jp-text">{{ group[0].questionDescription }}</p>
      
      <!-- 组合题听力播放器 -->
      <div v-if="isGroupListeningQuestion" class="audio-player">
        <audio 
          ref="groupAudioPlayer" 
          :src="group[0].hearingUrl" 
          controls
          @play="onGroupAudioPlay"
          @ended="onGroupAudioEnded"
          controlsList="nodownload"
          preload="none"
        ></audio>
      </div>
    </div>

    <!-- 组合题的各个小题 -->
    <!-- 组合题的各个小题 -->
    <div v-for="(question, questionIndex) in group" :key="questionIndex" class="group-question">
      <QuestionItem
        :question="question"
        :questionIndex="questionIndex"
        :groupIndex="groupIndex"
        :userAnswers="userAnswers"
        :isRandomPractice="isRandomPractice"
        :showExplanation="showExplanation"
        :isLastGroup="isLastGroup"
        :totalQuestions="totalQuestions"
        @answerSelect="$emit('answerSelect', $event)"
        @toggleExplanation="$emit('toggleExplanation', $event)"
      />
    </div>

    <!-- 图片放大模态框 -->
    <div v-if="showImageModal" class="image-modal" @wheel="handleWheel" tabindex="0" ref="modalRef">
      <div class="image-modal-content">
        <div class="image-container" ref="imageContainerRef">
          <button class="close-btn" @click="closeImageModal">&times;</button>
          
          <!-- 老师模式工具栏 - 只在老师模式显示 -->
          <div v-if="isTeacherMode" class="teacher-tools-modal">
            <button 
              :class="['tool-btn', { 'active': isDrawing }]" 
              @click="toggleDrawing"
              title="画笔工具"
            >
              <i class="ri-pencil-line"></i>
            </button>
            <button 
              class="tool-btn eraser" 
              @click="clearDrawing"
              title="清除画笔"
            >
              <i class="ri-eraser-line"></i>
            </button>
          </div>
          
          <img 
            :src="group[0].questionStemImage" 
            alt="阅读材料放大图" 
            class="modal-image"
            ref="modalImageRef"
          >
          
          <!-- 画布 - 只在老师模式且画笔激活时显示 -->
          <canvas
            v-if="isTeacherMode && isDrawing"
            ref="drawingCanvas"
            class="modal-drawing-canvas"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="startDrawing"
            @touchmove="draw"
            @touchend="stopDrawing"
          ></canvas>
        </div>
        <div class="scroll-hint">使用鼠标滚轮或上下键滚动查看</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import QuestionItem from './QuestionItem.vue'
import { ElMessage } from 'element-plus'

interface Props {
  group: any[]
  groupIndex: number
  isActive: boolean
  userAnswers: Record<number, number>
  isRandomPractice: boolean
  showExplanation: Record<number, boolean>
  isLastGroup: boolean
  playbackRate: number
  jlptLevel: string
  totalQuestions: number
}

const props = defineProps<Props>()
const emit = defineEmits(['answerSelect', 'toggleExplanation'])

// 获取路由和认证状态
const route = useRoute()
const authStore = useAuthStore()

// 老师模式检测逻辑
const isTeacherMode = computed(() => {
  const teacherParam = route.query.teacher
  const isTeacherUser = authStore.userInfo?.userRole === 1
  const teacherModeStorage = localStorage.getItem('teacherMode')
  
  return !!(teacherParam || isTeacherUser || teacherModeStorage)
})

const groupAudioPlayer = ref<HTMLAudioElement | null>(null)
const groupAudioStatus = ref('')
const showImageModal = ref(false)
const modalRef = ref<HTMLElement | null>(null)
const imageContainerRef = ref<HTMLElement | null>(null)
const modalImageRef = ref<HTMLImageElement | null>(null)

// 老师模式画笔相关状态
const isDrawing = ref(false)
const isDrawingActive = ref(false)
const drawingCanvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0

const hasGroupStem = computed(() => {
  return props.group[0].questionStem || props.group[0].questionStemImage || props.group[0].hearingUrl
})

const isGroupListeningQuestion = computed(() => {
  return props.group[0].hearingUrl !== null && props.group[0].hearingUrl !== undefined && props.group[0].hearingUrl !== ''
})

const setPlaybackRate = (rate: number) => {
  if (groupAudioPlayer.value) {
    groupAudioPlayer.value.playbackRate = rate
    groupAudioStatus.value = `${rate}x 倍速`
    setTimeout(() => {
      groupAudioStatus.value = ''
    }, 2000)
  }
}

const onGroupAudioPlay = (event: Event) => {
  const audio = event.target as HTMLAudioElement
  audio.playbackRate = props.playbackRate
  groupAudioStatus.value = '播放中...'
}

const onGroupAudioEnded = () => {
  groupAudioStatus.value = '播放完毕'
}

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.classList.add('loaded')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.classList.add('error')
  img.alt = '图片加载失败'
}

// 图片放大功能
const openImageModal = async () => {
  showImageModal.value = true
  document.body.style.overflow = 'hidden' // 防止背景滚动
  
  await nextTick()
  // 聚焦模态框以接收键盘事件
  if (modalRef.value) {
    modalRef.value.focus()
  }
}

const closeImageModal = () => {
  showImageModal.value = false
  document.body.style.overflow = '' // 恢复滚动
}

// 处理鼠标滚轮事件
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (imageContainerRef.value) {
    const scrollAmount = event.deltaY
    imageContainerRef.value.scrollTop += scrollAmount
  }
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (!showImageModal.value) return
  
  switch (event.key) {
    case 'Escape':
      closeImageModal()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (imageContainerRef.value) {
        imageContainerRef.value.scrollTop -= 50
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (imageContainerRef.value) {
        imageContainerRef.value.scrollTop += 50
      }
      break
  }
}

// 暂停并重置音频播放状态
const pauseAndResetAudio = () => {
  if (groupAudioPlayer.value) {
    groupAudioPlayer.value.pause()
    groupAudioPlayer.value.currentTime = 0
  }
}

// 监听 isActive 变化，当组变为非活动状态时暂停音频
watch(() => props.isActive, (newValue) => {
  if (!newValue) {
    pauseAndResetAudio()
  }
})

// 监听模态框状态变化，添加/移除键盘事件监听
watch(() => showImageModal.value, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 导出暂停音频方法，供父组件调用
defineExpose({
  pauseAndResetAudio
})

// 老师模式画笔工具方法
const toggleDrawing = () => {
  isDrawing.value = !isDrawing.value
  if (isDrawing.value) {
    nextTick(() => {
      setupCanvas()
    })
    ElMessage({
      message: '画笔模式已开启',
      type: 'success',
      duration: 1000
    })
  } else {
    ElMessage({
      message: '画笔模式已关闭',
      type: 'info',
      duration: 1000
    })
  }
}

const clearDrawing = () => {
  if (ctx && drawingCanvas.value) {
    ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
    ElMessage({
      message: '画笔内容已清除',
      type: 'success',
      duration: 1000
    })
  }
}

const setupCanvas = () => {
  if (!drawingCanvas.value || !modalImageRef.value) return
  
  const canvas = drawingCanvas.value
  const img = modalImageRef.value
  
  canvas.width = img.offsetWidth
  canvas.height = img.offsetHeight
  canvas.style.width = img.offsetWidth + 'px'
  canvas.style.height = img.offsetHeight + 'px'
  
  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.strokeStyle = '#ff4757'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
}

const getCanvasPosition = (e: MouseEvent | TouchEvent) => {
  const canvas = drawingCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  
  const rect = canvas.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!isTeacherMode.value || !isDrawing.value) return
  e.preventDefault()
  
  isDrawingActive.value = true
  const pos = getCanvasPosition(e)
  lastX = pos.x
  lastY = pos.y
  
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
  }
}

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawingActive.value || !ctx) return
  e.preventDefault()
  
  const pos = getCanvasPosition(e)
  
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  
  lastX = pos.x
  lastY = pos.y
}

const stopDrawing = () => {
  isDrawingActive.value = false
}
</script>

<style lang="scss" scoped>
.question-group {
  display: none;
  
  &.active {
    display: block;
  }
}

.group-stem-container {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  
  &.listening {
    border-left: 4px solid var(--primary-color);
  }
  
  &.reading {
    border-left: 4px solid var(--success-color);
  }
}

.group-stem-description {
  margin-bottom: var(--spacing-md);
  color: var(--text-light);
  font-style: italic;
}

.group-stem-text {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-lg);
  line-height: 1.8;
}

.group-question {
  margin-bottom: var(--spacing-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.reading-image-container {
  margin-bottom: var(--spacing-lg);
  position: relative;
  display: flex;
  justify-content: center;
  
  img {
    width: 640px;
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &.loaded {
      opacity: 1;
    }
    
    &.error {
      opacity: 0.5;
      filter: grayscale(100%);
      cursor: not-allowed;
    }
  }
  
  .image-zoom-hint {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  &:hover .image-zoom-hint {
    opacity: 1;
  }
}

// 图片放大模态框样式
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  outline: none;
  
  .image-modal-content {
    position: relative;
    width: 90vw;
    height: 90vh;
    display: flex;
    flex-direction: column;
    
    .image-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
      position: relative;
      
      .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 10px;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
        z-index: 10001;
        
        &:hover, &.active {
          background-color: var(--primary-color);
          transform: scale(1.1);
        }
      }
      
      .teacher-tools-modal {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        gap: 10px;
        z-index: 10001;
        
        .tool-btn {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          
          &:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: scale(1.05);
          }
          
          &.active {
            background-color: var(--primary-color);
          }
          
          &.eraser {
            background: rgba(255, 0, 0, 0.7);
            
            &:hover {
              background: rgba(255, 0, 0, 0.9);
            }
          }
          
          i {
            font-size: 1.2rem;
          }
        }
      }
      
      .modal-drawing-canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: auto;
        z-index: 10000;
      }
    }
  }
}

// 手机端适配
@media (max-width: 768px) {
  .image-modal {
    .image-container {
      .modal-drawing-toolbar {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        top: auto;
        
        .tool-btn {
          width: 50px;
          height: 50px;
          padding: 15px;
        }
      }
    }
  }
}
</style>
