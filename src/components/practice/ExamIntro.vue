<template>
  <div class="exam-intro">
    <div class="container">
      <div class="exam-header">
        <h1>{{ currentQuestion?.question || '日语练习题' }}</h1>
        <div class="exam-meta">
          <div class="meta-item">
            <i class="ri-time-line"></i>
            <span>{{ timeLimit }}分钟</span>
          </div>
          <div class="meta-item">
            <i class="ri-file-list-line"></i>
            <span>{{ getQuestionTypeText(currentQuestion?.tixing) }}</span>
          </div>
          <div class="meta-item">
            <i class="ri-award-line"></i>
            <span>{{ currentQuestion?.jlptLevel || 'N5' }}</span>
          </div>
        </div>
      </div>

      <div class="exam-instructions">
        <h2>练习说明</h2>
        <ul>
          <li>模拟练习下，会进行计时，时间为{{ timeLimit }}分钟，请合理分配时间</li>
          <li>随机练习下，不会进行计时，可以随时查看解析</li>
          <li>模拟练习过程中请勿刷新页面或离开当前页面</li>
          <li>模拟练习中所有题目答完后才能提交考试</li>
          <li>提交后将立即显示考试结果和详细解析</li>
          <li>建议在安静的环境下进行练习，特别是听力题目</li>
        </ul>
      </div>

      <div class="practice-tips">
        <h3>练习建议</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <i class="ri-lightbulb-line"></i>
            <h4>随机练习</h4>
            <p>适合日常学习，可以即时查看解析，加深理解</p>
          </div>
          <div class="tip-card">
            <i class="ri-timer-line"></i>
            <h4>模拟测试</h4>
            <p>模拟真实考试环境，限时答题，检验学习成果</p>
          </div>
        </div>
      </div>

      <div class="start-buttons">
        <button class="btn-random-practice" @click="$emit('startRandomPractice')">
          <i class="ri-shuffle-line"></i>
          随机练习
          <span class="btn-subtitle">不限时 · 即时解析</span>
        </button>
        <button class="btn-mock-test" @click="$emit('startMockTest')">
          <i class="ri-file-list-3-line"></i>
          模拟测试
          <span class="btn-subtitle">限时 · 完整评估</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentQuestion: any
  timeLimit: number
}

defineProps<Props>()
defineEmits(['startRandomPractice', 'startMockTest'])

const getQuestionTypeText = (tixing: string) => {
  const typeMap: { [key: string]: string } = {
    '文字': '文字词汇',
    '文法': '语法',
    '読解': '阅读理解',
    '聴解': '听力理解'
  }
  return typeMap[tixing] || '选择题'
}
</script>

<style lang="scss" scoped>
.exam-intro {
  padding: var(--spacing-xl) 0;

  .exam-header {
    background-color: white;
    padding: var(--spacing-xl);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);

    h1 {
      font-size: 2rem;
      margin-bottom: var(--spacing-md);
      color: var(--primary-color);
    }
  }

  .exam-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-light);

      i {
        font-size: 1.2rem;
        color: var(--primary-color);
      }
    }
  }
}

.exam-instructions {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      position: relative;
      padding-left: 20px;
      margin-bottom: var(--spacing-sm);
      color: var(--text-light);
      line-height: 1.6;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 10px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--primary-color);
      }
    }
  }
}

.practice-tips {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  // 在手机模式下隐藏练习建议部分
  @media (max-width: 768px) {
    display: none;
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
  }
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.tip-card {
  padding: var(--spacing-lg);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  text-align: center;

  i {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }

  h4 {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--text-light);
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

.start-buttons {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.btn-random-practice,
.btn-mock-test {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  position: relative;
  overflow: hidden;
  
  i {
    font-size: 1.5rem;
  }

  .btn-subtitle {
    font-size: 0.9rem;
    opacity: 0.9;
    font-weight: 400;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
}

.btn-random-practice {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.btn-mock-test {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}
</style>