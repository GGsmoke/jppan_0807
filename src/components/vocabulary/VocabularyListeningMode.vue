<template>
  <div class="vocabulary-listening-mode">
    <div class="mode-header">
      <div class="mode-tabs">
        <button 
          v-for="mode in listeningModes" 
          :key="mode.id"
          :class="['mode-tab', { active: currentMode === mode.id }]"
          @click="currentMode = mode.id"
        >
          <i :class="mode.icon"></i>
          {{ mode.name }}
        </button>
      </div>
    </div>
    
    <div class="mode-content">
      <!-- 单词听力练习 -->
      <WordListeningPractice 
        v-if="currentMode === 'word'"
        @show-contact="showContactDialog = true"
      />
      
      <!-- 例句默写练习 -->
      <SentenceDictationPractice 
        v-if="currentMode === 'sentence'"
        @show-contact="showContactDialog = true"
      />
      
      <!-- 例句拼图练习 -->
      <SentencePuzzlePractice 
        v-if="currentMode === 'puzzle'"
        @show-contact="showContactDialog = true"
      />
    </div>
    
    <!-- Contact Dialog -->
    <el-dialog
      v-model="showContactDialog"
      title="联系客服"
      width="360px"
      center
      :show-close="false"
      class="contact-dialog"
    >
      <div class="qr-container">
        <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服微信二维码" class="qr-code">
        <p>扫码添加客服微信</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showContactDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WordListeningPractice from './listening/WordListeningPractice.vue'
import SentenceDictationPractice from './listening/SentenceDictationPractice.vue'
import SentencePuzzlePractice from './listening/SentencePuzzlePractice.vue'
import { LISTENING_MODES } from '../../config/vocabulary-listening-config'

// 当前模式
const currentMode = ref('word')
const showContactDialog = ref(false)

// 听力练习模式
const listeningModes = LISTENING_MODES
</script>

<style lang="scss" scoped>
.vocabulary-listening-mode {
  width: 100%;
}

.mode-header {
  margin-bottom: var(--spacing-xl);
}

.mode-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  font-weight: 500;

  i {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}

.contact-dialog {
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
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>