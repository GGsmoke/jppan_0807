<template>
  <div class="listening-page">
    <div class="page-header">
      <div class="container">
        <h1>听力练习</h1>
        <p>提高日语听力理解能力</p>
      </div>
    </div>

    <div class="container">
      <div class="practice-section">
        <h2>听力练习题</h2>
        
        <!-- 练习题1 -->
        <div class="practice-item">
          <h3>练习 1: 日常对话</h3>
          <div class="audio-player">
            <audio controls>
              <source src="https://example.com/audio1.mp3" type="audio/mpeg">
              您的浏览器不支持音频播放
            </audio>
          </div>
          <div class="question">
            <p>问题：男子最后决定做什么？</p>
            <div class="options">
              <label class="option">
                <input type="radio" name="q1" value="A">
                <span>去超市</span>
              </label>
              <label class="option">
                <input type="radio" name="q1" value="B">
                <span>去图书馆</span>
              </label>
              <label class="option">
                <input type="radio" name="q1" value="C">
                <span>回家</span>
              </label>
              <label class="option">
                <input type="radio" name="q1" value="D">
                <span>去咖啡店</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 练习题2 -->
        <div class="practice-item">
          <h3>练习 2: 通知内容</h3>
          <div class="audio-player">
            <audio controls>
              <source src="https://example.com/audio2.mp3" type="audio/mpeg">
              您的浏览器不支持音频播放
            </audio>
          </div>
          <div class="question">
            <p>问题：图书馆明天什么时候开门？</p>
            <div class="options">
              <label class="option">
                <input type="radio" name="q2" value="A">
                <span>8:00</span>
              </label>
              <label class="option">
                <input type="radio" name="q2" value="B">
                <span>9:00</span>
              </label>
              <label class="option">
                <input type="radio" name="q2" value="C">
                <span>10:00</span>
              </label>
              <label class="option">
                <input type="radio" name="q2" value="D">
                <span>11:00</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 练习题3 -->
        <div class="practice-item">
          <h3>练习 3: 天气预报</h3>
          <div class="audio-player">
            <audio controls>
              <source src="https://example.com/audio3.mp3" type="audio/mpeg">
              您的浏览器不支持音频播放
            </audio>
          </div>
          <div class="question">
            <p>问题：明天的天气怎么样？</p>
            <div class="options">
              <label class="option">
                <input type="radio" name="q3" value="A">
                <span>晴天</span>
              </label>
              <label class="option">
                <input type="radio" name="q3" value="B">
                <span>阴天</span>
              </label>
              <label class="option">
                <input type="radio" name="q3" value="C">
                <span>雨天</span>
              </label>
              <label class="option">
                <input type="radio" name="q3" value="D">
                <span>雪天</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button class="btn btn-primary" @click="submitAnswers">
          提交答案
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const submitAnswers = () => {
  // 实现提交答案的逻辑
  console.log('提交答案')
}
</script>

<style lang="scss" scoped>
.listening-page {
  padding-bottom: var(--spacing-xxl);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
}

.practice-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-xl);
  }
}

.practice-item {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);
  }
}

.audio-player {
  margin-bottom: var(--spacing-lg);

  audio {
    width: 100%;
  }
}

.question {
  p {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-md);
  }
}

.options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--background-color);
  }

  input {
    margin: 0;
  }
}

.submit-section {
  text-align: center;

  button {
    padding: 12px 30px;
    font-size: 1.1rem;
  }
}
</style>