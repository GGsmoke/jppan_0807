<template>
  <div class="faq-page">
    <div class="page-header">
      <div class="container">
        <h1>常见问题</h1>
        <p>解答您的疑惑</p>
      </div>
    </div>

    <div class="container">
      <div class="faq-section">
        <div class="faq-categories">
          <button 
            v-for="category in categories"
            :key="category.id"
            :class="['category-btn', { active: currentCategory === category.id }]"
            @click="currentCategory = category.id"
          >
            <i :class="category.icon"></i>
            {{ category.name }}
          </button>
        </div>

        <div class="faq-list">
          <div 
            v-for="faq in filteredFaqs"
            :key="faq.id"
            class="faq-item"
            :class="{ active: activeFaq === faq.id }"
          >
            <div class="faq-question" @click="toggleFaq(faq.id)">
              <h3>{{ faq.question }}</h3>
              <i class="ri-arrow-down-s-line"></i>
            </div>
            <div class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-section">
        <h2>还有其他问题？</h2>
        <p>如果您没有找到想要的答案，可以直接联系我们的客服团队。</p>
        <div class="contact-buttons">
          <button class="btn-contact">
            <i class="ri-customer-service-2-line"></i>
            在线咨询
          </button>
          <button class="btn-contact">
            <i class="ri-mail-line"></i>
            发送邮件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentCategory = ref('general')
const activeFaq = ref('')

interface Category {
  id: string
  name: string
  icon: string
}

interface FAQ {
  id: string
  categoryId: string
  question: string
  answer: string
}

const categories = ref<Category[]>([
  {
    id: 'general',
    name: '一般问题',
    icon: 'ri-question-line'
  },
  {
    id: 'course',
    name: '课程相关',
    icon: 'ri-book-open-line'
  },
  {
    id: 'payment',
    name: '支付问题',
    icon: 'ri-bank-card-line'
  },
  {
    id: 'technical',
    name: '技术支持',
    icon: 'ri-computer-line'
  }
])

const faqs = ref<FAQ[]>([
  {
    id: 'faq-1',
    categoryId: 'general',
    question: '如何开始学习日语？',
    answer: '建议从五十音图开始学习，掌握基本发音和书写规则。然后可以学习基础语法和常用词汇，逐步提高听说读写能力。'
  },
  {
    id: 'faq-2',
    categoryId: 'course',
    question: '课程是否有有效期？',
    answer: '是的，我们的课程有效期通常为购买后的12个月。在此期间，您可以无限次观看课程视频和下载学习资料。'
  },
  {
    id: 'faq-3',
    categoryId: 'payment',
    question: '支持哪些支付方式？',
    answer: '我们支持支付宝、微信支付、银联卡等多种支付方式，可以根据您的习惯选择合适的支付方式。'
  },
  {
    id: 'faq-4',
    categoryId: 'technical',
    question: '视频无法播放怎么办？',
    answer: '请先检查网络连接是否正常，然后清除浏览器缓存并刷新页面。如果问题仍然存在，请联系我们的技术支持。'
  }
])

const filteredFaqs = computed(() => {
  return faqs.value.filter(faq => faq.categoryId === currentCategory.value)
})

const toggleFaq = (faqId: string) => {
  activeFaq.value = activeFaq.value === faqId ? '' : faqId
}
</script>

<style lang="scss" scoped>
.faq-page {
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

.faq-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.faq-categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: none;
  cursor: pointer;
  transition: all var(--transition-fast);

  i {
    font-size: 1.2rem;
  }

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

.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.faq-item {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;

  .faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    cursor: pointer;
    background-color: var(--background-color);

    h3 {
      font-size: 1.1rem;
      margin: 0;
    }

    i {
      font-size: 1.5rem;
      transition: transform var(--transition-fast);
    }
  }

  .faq-answer {
    padding: 0 var(--spacing-lg);
    max-height: 0;
    overflow: hidden;
    transition: all var(--transition-normal);

    p {
      color: var(--text-light);
      line-height: 1.6;
      padding: var(--spacing-lg) 0;
    }
  }

  &.active {
    .faq-question {
      background-color: var(--primary-color);
      color: white;

      i {
        transform: rotate(180deg);
      }
    }

    .faq-answer {
      max-height: 500px;
    }
  }
}

.contact-section {
  text-align: center;
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-lg);
  }
}

.contact-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.btn-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--primary-dark);
  }

  i {
    font-size: 1.2rem;
  }
}
</style>