<template>
  <div class="study-method-page">
    <div class="page-header">
      <div class="container">
        <h1>学习方法</h1>
        <p>科学高效的日语学习方法指导</p>
      </div>
    </div>

    <div class="container">
      <div class="method-section">
        <h2>学习计划制定</h2>
        <div class="method-grid">
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-calendar-check-line"></i>
            </div>
            <h3>合理规划时间</h3>
            <p>建议每天固定时间学习，保持学习的连续性和规律性。可以根据个人情况，每天安排1-2小时的学习时间。</p>
          </div>
          
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-focus-3-line"></i>
            </div>
            <h3>明确学习目标</h3>
            <p>设定清晰的短期和长期目标，如"三个月内通过N5考试"，让学习更有方向性。</p>
          </div>
          
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-rhythm-line"></i>
            </div>
            <h3>循序渐进</h3>
            <p>从基础开始，逐步提高难度。不要急于求成，确保每个阶段的知识都能够扎实掌握。</p>
          </div>
        </div>
      </div>

      <div class="method-section">
        <h2>记忆技巧</h2>
        <div class="method-grid">
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-repeat-line"></i>
            </div>
            <h3>艾宾浩斯复习法</h3>
            <p>按照科学的间隔时间进行复习，如第1天、第2天、第4天、第7天、第15天等，提高记忆效果。</p>
          </div>
          
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-mind-map"></i>
            </div>
            <h3>联想记忆法</h3>
            <p>将新的日语单词与已知的概念建立联系，通过故事或图像等方式加深印象。</p>
          </div>
          
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-file-paper-2-line"></i>
            </div>
            <h3>制作记忆卡片</h3>
            <p>使用闪卡或记忆卡片，正面写单词，背面写读音和含义，随时复习。</p>
          </div>
        </div>
      </div>

      <div class="method-section">
        <h2>提高听说能力</h2>
        <div class="method-grid">
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-video-line"></i>
            </div>
            <h3>观看日剧动漫</h3>
            <p>选择适合自己水平的日语视频内容，开始时可以看中文字幕，逐渐过渡到日文字幕。</p>
          </div>
          
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-record-circle-line"></i>
            </div>
            <h3>录音练习</h3>
            <p>录下自己说日语的声音，对比标准发音，找出问题并改正。</p>
          </div>
          
          <div class="method-card">
            <div class="method-icon">
              <i class="ri-chat-1-line"></i>
            </div>
            <h3>寻找语伴</h3>
            <p>找到日语学习伙伴，定期进行会话练习，互相督促和帮助。</p>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <h2>学习小贴士</h2>
        <div class="tips-list">
          <div class="tip-item">
            <i class="ri-checkbox-circle-line"></i>
            <div class="tip-content">
              <h4>保持学习动力</h4>
              <p>设定奖励机制，完成学习目标后给自己一些小奖励，保持学习积极性。</p>
            </div>
          </div>
          
          <div class="tip-item">
            <i class="ri-checkbox-circle-line"></i>
            <div class="tip-content">
              <h4>创造学习环境</h4>
              <p>将手机语言设置为日语，在家中贴上日语单词标签，增加语言接触机会。</p>
            </div>
          </div>
          
          <div class="tip-item">
            <i class="ri-checkbox-circle-line"></i>
            <div class="tip-content">
              <h4>做好笔记</h4>
              <p>养成记笔记的习惯，整理学习重点，方便日后复习。</p>
            </div>
          </div>
          
          <div class="tip-item">
            <i class="ri-checkbox-circle-line"></i>
            <div class="tip-content">
              <h4>及时纠错</h4>
              <p>遇到不懂的地方及时查询，不要积累错误理解。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional script needed for this page
</script>

<style lang="scss" scoped>
.study-method-page {
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

.method-section {
  margin-bottom: var(--spacing-xxl);

  h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-xl);
    text-align: center;
    color: var(--primary-color);

    &::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background-color: var(--primary-color);
      margin: var(--spacing-sm) auto 0;
    }
  }
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.method-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
}

.method-icon {
  width: 60px;
  height: 60px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);

  i {
    font-size: 1.8rem;
  }
}

.method-card h3 {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
}

.method-card p {
  color: var(--text-light);
  line-height: 1.6;
}

.tips-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-xl);
    text-align: center;
    color: var(--primary-color);
  }
}

.tips-list {
  display: grid;
  gap: var(--spacing-lg);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);

  i {
    color: var(--primary-color);
    font-size: 1.5rem;
    flex-shrink: 0;
  }
}

.tip-content {
  h4 {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-xs);
  }

  p {
    color: var(--text-light);
    line-height: 1.6;
  }
}
</style>