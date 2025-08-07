<template>
  <div class="reading-page">
    <div class="page-header">
      <div class="container">
        <h1>阅读练习</h1>
        <p>提高日语阅读理解能力</p>
      </div>
    </div>

    <div class="container">
      <div class="practice-section">
        <h2>阅读练习题</h2>
        
        <!-- 练习题1 -->
        <div class="practice-item">
          <h3>练习 1: 短文阅读</h3>
          <div class="reading-text">
            <p class="jp-text">
              私の趣味は読書です。休みの日には、よく図書館に行きます。
              先週の日曜日も図書館で本を読んでいました。その時、高校時代の友達に会いました。
              彼女も私と同じように、本を読むのが好きです。私たちは一緒にコーヒーを飲みながら、
              いろいろな話をしました。とても楽しい一日でした。
            </p>
          </div>
          <div class="question">
            <p>问题：作者在图书馆遇到了谁？</p>
            <div class="options">
              <label class="option">
                <input type="radio" name="q1" value="A">
                <span>大学同学</span>
              </label>
              <label class="option">
                <input type="radio" name="q1" value="B">
                <span>高中同学</span>
              </label>
              <label class="option">
                <input type="radio" name="q1" value="C">
                <span>小学同学</span>
              </label>
              <label class="option">
                <input type="radio" name="q1" value="D">
                <span>初中同学</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 练习题2 -->
        <div class="practice-item">
          <h3>练习 2: 广告阅读</h3>
          <div class="reading-text">
            <p class="jp-text">
              【新商品のお知らせ】
              明日から、新しい日本語教材「みんなの日本語」が発売されます。
              初級から上級まで、レベルに合わせて学習できます。
              発売記念として、明日から一週間、20%割引でご提供いたします。
              ぜひ、この機会にお買い求めください。
            </p>
          </div>
          <div class="question">
            <p>问题：这个广告的主要内容是什么？</p>
            <div class="options">
              <label class="option">
                <input type="radio" name="q2" value="A">
                <span>新店铺开业通知</span>
              </label>
              <label class="option">
                <input type="radio" name="q2" value="B">
                <span>新教材发售通知</span>
              </label>
              <label class="option">
                <input type="radio" name="q2" value="C">
                <span>招聘通知</span>
              </label>
              <label class="option">
                <input type="radio" name="q2" value="D">
                <span>休业通知</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 练习题3 -->
        <div class="practice-item">
          <h3>练习 3: 邮件阅读</h3>
          <div class="reading-text">
            <p class="jp-text">
              田中様
              
              お世話になっております。
              来週の会議の件について、ご連絡いたします。
              予定していた14日（火）から15日（水）に変更となりました。
              ご確認のほど、よろしくお願いいたします。
              
              鈴木
            </p>
          </div>
          <div class="question">
            <p>问题：会议改到什么时候举行？</p>
            <div class="options">
              <label class="option">
                <input type="radio" name="q3" value="A">
                <span>周一</span>
              </label>
              <label class="option">
                <input type="radio" name="q3" value="B">
                <span>周二</span>
              </label>
              <label class="option">
                <input type="radio" name="q3" value="C">
                <span>周三</span>
              </label>
              <label class="option">
                <input type="radio" name="q3" value="D">
                <span>周四</span>
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

}
</script>

<style lang="scss" scoped>
.reading-page {
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

.reading-text {
  background-color: var(--background-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);

  .jp-text {
    font-size: 1.1rem;
    line-height: 1.8;
    white-space: pre-line;
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