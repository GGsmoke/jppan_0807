<template>
  <div class="conversation-practice">
    <!-- 场景选择 -->
    <div v-if="!practiceStarted" class="scene-selection">
      <div class="scene-header">
        <h2>选择会话场景</h2>
        <p>选择一个场景开始练习日语会话</p>
      </div>
      
      <div class="scenes-grid">
        <div 
          v-for="scene in conversationScenes" 
          :key="scene.id"
          class="scene-card"
          @click="selectScene(scene)"
        >
          <div class="scene-image">
            <img :src="scene.image" :alt="scene.title">
            <div class="scene-level">{{ scene.level }}</div>
          </div>
          <div class="scene-content">
            <h3>{{ scene.title }}</h3>
            <p>{{ scene.description }}</p>
            <div class="scene-stats">
              <span><i class="ri-chat-1-line"></i> {{ scene.dialogCount }}段对话</span>
              <span><i class="ri-time-line"></i> {{ scene.duration }}分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 会话练习界面 -->
    <div v-else-if="practiceStarted && !practiceCompleted" class="practice-interface">
      <div class="practice-header">
        <div class="scene-info">
          <h3>{{ selectedScene?.title }}</h3>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${(currentDialogIndex + 1) / currentDialogs.length * 100}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ currentDialogIndex + 1 }} / {{ currentDialogs.length }}</span>
        </div>
        <button class="btn-exit" @click="exitPractice">
          <i class="ri-close-line"></i>
          退出练习
        </button>
      </div>

      <div class="dialog-container">
        <div class="dialog-scene">
          <img :src="selectedScene?.image" :alt="selectedScene?.title" class="scene-bg">
          <div class="characters">
            <div 
              v-for="character in currentDialog?.characters" 
              :key="character.id"
              :class="['character', { 'speaking': character.id === currentSpeaker }]"
            >
              <img :src="character.avatar" :alt="character.name">
              <span class="character-name">{{ character.name }}</span>
            </div>
          </div>
        </div>

        <div class="dialog-content">
          <div class="dialog-text">
            <div class="speaker-info">
              <img :src="getCurrentCharacter()?.avatar" :alt="getCurrentCharacter()?.name">
              <span>{{ getCurrentCharacter()?.name }}</span>
            </div>
            <div class="text-content">
              <p class="japanese-text">{{ currentDialog?.text }}</p>
              <p class="chinese-text" v-if="showTranslation">{{ currentDialog?.translation }}</p>
            </div>
            <div class="dialog-controls">
              <button class="control-btn" @click="playAudio" :disabled="isPlaying">
                <i :class="isPlaying ? 'ri-pause-line' : 'ri-play-line'"></i>
              </button>
              <button class="control-btn" @click="toggleTranslation">
                <i class="ri-translate-2"></i>
              </button>
              <button class="control-btn" @click="startRecording" :disabled="isRecording">
                <i class="ri-mic-line"></i>
              </button>
            </div>
          </div>

          <div class="practice-options">
            <div class="option-tabs">
              <button 
                :class="['tab-btn', { active: practiceMode === 'listen' }]"
                @click="practiceMode = 'listen'"
              >
                <i class="ri-headphone-line"></i>
                听力练习
              </button>
              <button 
                :class="['tab-btn', { active: practiceMode === 'speak' }]"
                @click="practiceMode = 'speak'"
              >
                <i class="ri-mic-line"></i>
                口语练习
              </button>
              <button 
                :class="['tab-btn', { active: practiceMode === 'role' }]"
                @click="practiceMode = 'role'"
              >
                <i class="ri-user-voice-line"></i>
                角色扮演
              </button>
            </div>

            <!-- 听力练习 -->
            <div v-if="practiceMode === 'listen'" class="listen-practice">
              <h4>听音选择</h4>
              <p>请听音频，选择正确的日语表达：</p>
              <div class="options">
                <label 
                  v-for="(option, index) in currentDialog?.options" 
                  :key="index"
                  class="option-item"
                >
                  <input 
                    type="radio" 
                    :name="`dialog-${currentDialogIndex}`"
                    :value="index"
                    v-model="userAnswer"
                  >
                  <span>{{ option }}</span>
                </label>
              </div>
            </div>

            <!-- 口语练习 -->
            <div v-if="practiceMode === 'speak'" class="speak-practice">
              <h4>跟读练习</h4>
              <p>请跟读以下日语句子：</p>
              <div class="recording-area">
                <div :class="['recording-status', { recording: isRecording }]">
                  <i class="ri-mic-line"></i>
                  <span>{{ isRecording ? '正在录音...' : '点击开始录音' }}</span>
                </div>
                <button 
                  class="record-btn"
                  @click="toggleRecording"
                  :class="{ recording: isRecording }"
                >
                  {{ isRecording ? '停止录音' : '开始录音' }}
                </button>
              </div>
              <div v-if="recordedAudio" class="playback-area">
                <h5>您的录音：</h5>
                <audio :src="recordedAudio" controls></audio>
                <div class="feedback">
                  <span class="score">发音评分: {{ pronunciationScore }}/100</span>
                  <button class="btn-retry" @click="retryRecording">重新录音</button>
                </div>
              </div>
            </div>

            <!-- 角色扮演 -->
            <div v-if="practiceMode === 'role'" class="role-practice">
              <h4>角色扮演</h4>
              <p>选择一个角色，与AI进行对话练习：</p>
              <div class="role-selection">
                <div 
                  v-for="character in currentDialog?.characters" 
                  :key="character.id"
                  :class="['role-card', { selected: selectedRole === character.id }]"
                  @click="selectedRole = character.id"
                >
                  <img :src="character.avatar" :alt="character.name">
                  <span>{{ character.name }}</span>
                </div>
              </div>
              <div v-if="selectedRole" class="chat-area">
                <div class="chat-messages">
                  <div 
                    v-for="(message, index) in chatMessages" 
                    :key="index"
                    :class="['message', message.type]"
                  >
                    <div class="message-content">
                      <p class="japanese">{{ message.japanese }}</p>
                      <p class="chinese">{{ message.chinese }}</p>
                    </div>
                  </div>
                </div>
                <div class="chat-input">
                  <input 
                    type="text" 
                    v-model="userInput"
                    placeholder="请输入日语回复..."
                    @keyup.enter="sendMessage"
                  >
                  <button @click="sendMessage" :disabled="!userInput.trim()">
                    <i class="ri-send-plane-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="navigation-controls">
            <button 
              class="nav-btn prev"
              @click="previousDialog"
              :disabled="currentDialogIndex === 0"
            >
              <i class="ri-arrow-left-line"></i>
              上一句
            </button>
            <button 
              class="nav-btn next"
              @click="nextDialog"
              :disabled="currentDialogIndex === currentDialogs.length - 1"
            >
              下一句
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 练习完成 -->
    <div v-else class="practice-completed">
      <div class="completion-header">
        <div class="success-icon">
          <i class="ri-check-line"></i>
        </div>
        <h2>练习完成！</h2>
        <p>恭喜您完成了「{{ selectedScene?.title }}」的会话练习</p>
      </div>

      <div class="practice-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <div class="stat-value">{{ practiceStats.dialogsCompleted }}</div>
            <div class="stat-label">完成对话</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ practiceStats.timeSpent }}分钟</div>
            <div class="stat-label">练习时长</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ practiceStats.averageScore }}</div>
            <div class="stat-label">平均得分</div>
          </div>
        </div>

        <div class="achievements">
          <h3>获得成就</h3>
          <div class="achievement-list">
            <div 
              v-for="achievement in earnedAchievements" 
              :key="achievement.id"
              class="achievement-item"
            >
              <i :class="achievement.icon"></i>
              <span>{{ achievement.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="completion-actions">
        <button class="btn-retry" @click="retryPractice">
          <i class="ri-refresh-line"></i>
          重新练习
        </button>
        <button class="btn-next" @click="selectNextScene">
          <i class="ri-arrow-right-line"></i>
          下一场景
        </button>
        <button class="btn-back" @click="backToScenes">
          <i class="ri-home-line"></i>
          返回场景
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Character {
  id: string
  name: string
  avatar: string
}

interface Dialog {
  id: string
  text: string
  translation: string
  speaker: string
  audioUrl: string
  characters: Character[]
  options?: string[]
  correctAnswer?: number
}

interface ConversationScene {
  id: string
  title: string
  description: string
  image: string
  level: string
  dialogCount: number
  duration: number
  dialogs: Dialog[]
}

interface ChatMessage {
  type: 'user' | 'ai'
  japanese: string
  chinese: string
}

interface Achievement {
  id: string
  name: string
  icon: string
}

const practiceStarted = ref(false)
const practiceCompleted = ref(false)
const selectedScene = ref<ConversationScene | null>(null)
const currentDialogIndex = ref(0)
const practiceMode = ref('listen')
const showTranslation = ref(false)
const isPlaying = ref(false)
const isRecording = ref(false)
const userAnswer = ref<number | null>(null)
const selectedRole = ref<string | null>(null)
const userInput = ref('')
const chatMessages = ref<ChatMessage[]>([])
const recordedAudio = ref<string | null>(null)
const pronunciationScore = ref(0)

const practiceStats = ref({
  dialogsCompleted: 0,
  timeSpent: 0,
  averageScore: 0
})

const earnedAchievements = ref<Achievement[]>([])

// 会话场景数据
const conversationScenes = ref<ConversationScene[]>([
  {
    id: 'restaurant',
    title: '餐厅点餐',
    description: '学习在日本餐厅如何点餐、询问菜品、结账等实用对话',
    image: 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg?auto=compress&cs=tinysrgb&w=600',
    level: 'N4',
    dialogCount: 8,
    duration: 15,
    dialogs: [
      {
        id: 'rest_1',
        text: 'いらっしゃいませ。何名様ですか？',
        translation: '欢迎光临。请问几位？',
        speaker: 'waiter',
        audioUrl: '/audio/restaurant_1.mp3',
        characters: [
          { id: 'waiter', name: '服务员', avatar: '/avatars/waiter.png' },
          { id: 'customer', name: '顾客', avatar: '/avatars/customer.png' }
        ],
        options: [
          'いらっしゃいませ。何名様ですか？',
          'いらっしゃいませ。何人ですか？',
          'こんにちは。何名様ですか？',
          'すみません。何名様ですか？'
        ],
        correctAnswer: 0
      }
      // 更多对话...
    ]
  },
  {
    id: 'shopping',
    title: '购物场景',
    description: '掌握在商店购物时的常用表达，包括询问价格、讨价还价等',
    image: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=600',
    level: 'N5',
    dialogCount: 6,
    duration: 12,
    dialogs: []
  },
  {
    id: 'station',
    title: '车站问路',
    description: '学习在车站询问方向、购买车票、确认时刻表等对话',
    image: 'https://images.pexels.com/photos/2815033/pexels-photo-2815033.jpeg?auto=compress&cs=tinysrgb&w=600',
    level: 'N3',
    dialogCount: 10,
    duration: 18,
    dialogs: []
  },
  {
    id: 'hospital',
    title: '医院就医',
    description: '掌握在医院挂号、描述症状、听取医嘱等重要对话',
    image: 'https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=600',
    level: 'N2',
    dialogCount: 12,
    duration: 20,
    dialogs: []
  }
])

const currentDialogs = computed(() => selectedScene.value?.dialogs || [])
const currentDialog = computed(() => currentDialogs.value[currentDialogIndex.value])
const currentSpeaker = computed(() => currentDialog.value?.speaker)

const getCurrentCharacter = () => {
  return currentDialog.value?.characters.find(c => c.id === currentSpeaker.value)
}

const selectScene = (scene: ConversationScene) => {
  selectedScene.value = scene
  practiceStarted.value = true
  currentDialogIndex.value = 0
  practiceMode.value = 'listen'
}

const exitPractice = () => {
  practiceStarted.value = false
  practiceCompleted.value = false
  selectedScene.value = null
  currentDialogIndex.value = 0
}

const playAudio = () => {
  if (currentDialog.value?.audioUrl) {
    isPlaying.value = true
    const audio = new Audio(currentDialog.value.audioUrl)
    audio.onended = () => {
      isPlaying.value = false
    }
    audio.play()
  }
}

const toggleTranslation = () => {
  showTranslation.value = !showTranslation.value
}

const startRecording = () => {
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {

  } else {
    // 停止录音并分析
    console.log('停止录音')
    recordedAudio.value = '/temp/recorded.wav'
    pronunciationScore.value = Math.floor(Math.random() * 30) + 70 // 模拟评分
  }
}

const retryRecording = () => {
  recordedAudio.value = null
  pronunciationScore.value = 0
}

const sendMessage = () => {
  if (!userInput.value.trim()) return
  
  chatMessages.value.push({
    type: 'user',
    japanese: userInput.value,
    chinese: '用户输入的中文翻译'
  })
  
  // 模拟AI回复
  setTimeout(() => {
    chatMessages.value.push({
      type: 'ai',
      japanese: 'そうですね。とても良いですね。',
      chinese: '是的，非常好呢。'
    })
  }, 1000)
  
  userInput.value = ''
}

const previousDialog = () => {
  if (currentDialogIndex.value > 0) {
    currentDialogIndex.value--
  }
}

const nextDialog = () => {
  if (currentDialogIndex.value < currentDialogs.value.length - 1) {
    currentDialogIndex.value++
  } else {
    completePractice()
  }
}

const completePractice = () => {
  practiceCompleted.value = true
  practiceStats.value = {
    dialogsCompleted: currentDialogs.value.length,
    timeSpent: Math.floor(Math.random() * 10) + 10,
    averageScore: Math.floor(Math.random() * 20) + 80
  }
  
  earnedAchievements.value = [
    { id: 'first_complete', name: '初次完成', icon: 'ri-trophy-line' },
    { id: 'good_pronunciation', name: '发音达人', icon: 'ri-mic-line' }
  ]
}

const retryPractice = () => {
  currentDialogIndex.value = 0
  practiceCompleted.value = false
  practiceStarted.value = true
}

const selectNextScene = () => {
  const currentIndex = conversationScenes.value.findIndex(s => s.id === selectedScene.value?.id)
  if (currentIndex < conversationScenes.value.length - 1) {
    selectScene(conversationScenes.value[currentIndex + 1])
  }
}

const backToScenes = () => {
  practiceStarted.value = false
  practiceCompleted.value = false
  selectedScene.value = null
}
</script>

<style lang="scss" scoped>
@use "sass:color";
.conversation-practice {
  min-height: calc(100vh - 60px);
  background-color: var(--background-color);
}

.scene-selection {
  padding: var(--spacing-xl);
}

.scene-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  
  h2 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-light);
    font-size: 1.1rem;
  }
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.scene-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
}

.scene-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .scene-level {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: var(--primary-color);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.scene-content {
  padding: var(--spacing-lg);
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }
  
  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }
}

.scene-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--text-light);
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.practice-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.practice-header {
  background-color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-info {
  flex: 1;
  
  h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
}

.progress-bar {
  width: 300px;
  height: 6px;
  background-color: var(--background-color);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
  
  .progress-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width var(--transition-normal);
  }
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-light);
}

.btn-exit {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--error-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: color.adjust(#e74c3c, $lightness: -10%);
  }
}

.dialog-container {
  flex: 1;
  display: flex;
  background-color: var(--background-color);
}

.dialog-scene {
  flex: 1;
  position: relative;
  background-color: #f0f8ff;
  
  .scene-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.3;
  }
  
  .characters {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: var(--spacing-lg);
  }
}

.character {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all var(--transition-fast);
  
  &.speaking {
    transform: scale(1.1);
    
    img {
      border-color: var(--primary-color);
      box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
    }
  }
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid white;
    object-fit: cover;
    margin-bottom: var(--spacing-sm);
  }
  
  .character-name {
    background-color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.dialog-content {
  width: 400px;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.dialog-text {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  
  span {
    font-weight: 500;
    color: var(--primary-color);
  }
}

.text-content {
  margin-bottom: var(--spacing-md);
  
  .japanese-text {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: var(--spacing-sm);
  }
  
  .chinese-text {
    color: var(--text-light);
    font-size: 1rem;
  }
}

.dialog-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.practice-options {
  flex: 1;
  padding: var(--spacing-lg);
}

.option-tabs {
  display: flex;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--spacing-md);
  border: none;
  background: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.active {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
  }
}

.listen-practice,
.speak-practice,
.role-practice {
  h4 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-md);
  }
}

.options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-color);
  }
}

.recording-area {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.recording-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
  
  &.recording {
    border-color: var(--error-color);
    background-color: rgba(231, 76, 60, 0.1);
    
    i {
      color: var(--error-color);
      animation: pulse 1s infinite;
    }
  }
}

.record-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.recording {
    background-color: var(--error-color);
  }
  
  &:hover {
    transform: translateY(-1px);
  }
}

.playback-area {
  background-color: var(--background-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  
  h5 {
    margin-bottom: var(--spacing-sm);
  }
  
  audio {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
}

.feedback {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .score {
    font-weight: 500;
    color: var(--success-color);
  }
}

.btn-retry {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
}

.role-selection {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.selected {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.1);
  }
  
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: var(--spacing-sm);
  }
}

.chat-area {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.chat-messages {
  height: 200px;
  overflow-y: auto;
  padding: var(--spacing-md);
  background-color: var(--background-color);
}

.message {
  margin-bottom: var(--spacing-md);
  
  &.user {
    text-align: right;
    
    .message-content {
      background-color: var(--primary-color);
      color: white;
      margin-left: 20%;
    }
  }
  
  &.ai {
    text-align: left;
    
    .message-content {
      background-color: white;
      margin-right: 20%;
    }
  }
}

.message-content {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  
  .japanese {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .chinese {
    font-size: 0.9rem;
    opacity: 0.8;
  }
}

.chat-input {
  display: flex;
  padding: var(--spacing-sm);
  background-color: white;
  
  input {
    flex: 1;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    margin-right: var(--spacing-sm);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
  
  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    cursor: pointer;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.navigation-controls {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.practice-completed {
  padding: var(--spacing-xl);
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.completion-header {
  margin-bottom: var(--spacing-xl);
  
  .success-icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: var(--success-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-lg);
    font-size: 3rem;
  }
  
  h2 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-light);
    font-size: 1.1rem;
  }
}

.practice-summary {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  text-align: center;
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
  
  .stat-label {
    color: var(--text-light);
    font-size: 0.9rem;
  }
}

.achievements {
  h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }
}

.achievement-list {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  
  i {
    font-size: 2rem;
    color: var(--accent-color);
    margin-bottom: var(--spacing-sm);
  }
  
  span {
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.btn-retry,
.btn-next,
.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-1px);
  }
}

.btn-retry {
  background-color: var(--accent-color);
  color: white;
}

.btn-next {
  background-color: var(--primary-color);
  color: white;
}

.btn-back {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>