<template>
  <div class="contact-page">
    <div class="page-header">
      <div class="container">
        <h1>联系我们</h1>
        <p>我们随时为您提供帮助</p>
      </div>
    </div>

    <div class="container">
      <div class="contact-grid">
        <div class="contact-info">
          <div class="info-section">
            <h2>联系方式</h2>
            <div class="info-list">
              <div class="info-item">
                <i class="ri-customer-service-2-line"></i>
                <div class="info-content">
                  <h3>客服热线</h3>
                  <p>400-123-4567</p>
                  <p class="text-muted">周一至周日 9:00-21:00</p>
                </div>
              </div>

              <div class="info-item">
                <i class="ri-mail-line"></i>
                <div class="info-content">
                  <h3>电子邮件</h3>
                  <p>support@chunshuariyu.com</p>
                  <p class="text-muted">24小时内回复</p>
                </div>
              </div>

              <div class="info-item">
                <i class="ri-wechat-line"></i>
                <div class="info-content">
                  <h3>微信咨询</h3>
                  <p>扫描二维码添加客服</p>
                  <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="微信二维码" class="qr-code">
                </div>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>公司地址</h2>
            <div class="address-info">
              <i class="ri-map-pin-line"></i>
              <div class="address-content">
                <p>上海市浦东新区xxx路xxx号</p>
                <p class="text-muted">邮编: 200000</p>
              </div>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <h2>在线留言</h2>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">姓名</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name"
                required
                placeholder="请输入您的姓名"
              >
            </div>

            <div class="form-group">
              <label for="email">邮箱</label>
              <input 
                type="email" 
                id="email" 
                v-model="formData.email"
                required
                placeholder="请输入您的邮箱"
              >
            </div>

            <div class="form-group">
              <label for="phone">电话</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="formData.phone"
                placeholder="请输入您的电话号码"
              >
            </div>

            <div class="form-group">
              <label for="type">问题类型</label>
              <select id="type" v-model="formData.type">
                <option value="course">课程咨询</option>
                <option value="technical">技术支持</option>
                <option value="payment">支付问题</option>
                <option value="other">其他问题</option>
              </select>
            </div>

            <div class="form-group">
              <label for="message">留言内容</label>
              <textarea 
                id="message" 
                v-model="formData.message"
                required
                rows="5"
                placeholder="请详细描述您的问题"
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary">
              提交留言
            </button>
          </form>
        </div>
      </div>

      <div class="faq-section">
        <h2>常见问题</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3>如何开始学习？</h3>
            <p>注册账号后，可以根据自己的日语水平选择适合的课程开始学习。我们提供从N5到N1各个级别的课程。</p>
          </div>

          <div class="faq-item">
            <h3>忘记密码怎么办？</h3>
            <p>点击登录页面的"忘记密码"链接，通过邮箱验证后可以重置密码。</p>
          </div>

          <div class="faq-item">
            <h3>如何购买课程？</h3>
            <p>在课程详情页面点击"购买课程"按钮，选择支付方式完成付款即可。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  phone: '',
  type: 'course',
  message: ''
})

const submitForm = () => {

}
</script>

<style lang="scss" scoped>
.contact-page {
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

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.contact-info {
  .info-section {
    background-color: white;
    border-radius: var(--border-radius);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-sm);

    h2 {
      font-size: 1.3rem;
      margin-bottom: var(--spacing-lg);
      color: var(--primary-color);
    }
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);

  i {
    font-size: 1.5rem;
    color: var(--primary-color);
  }

  .info-content {
    h3 {
      font-size: 1.1rem;
      margin-bottom: 5px;
    }

    p {
      margin-bottom: 3px;

      &.text-muted {
        color: var(--text-light);
        font-size: 0.9rem;
      }
    }

    .qr-code {
      width: 150px;
      height: 150px;
      margin-top: var(--spacing-sm);
    }
  }
}

.address-info {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);

  i {
    font-size: 1.5rem;
    color: var(--primary-color);
  }

  .address-content {
    p {
      margin-bottom: 5px;

      &.text-muted {
        color: var(--text-light);
        font-size: 0.9rem;
      }
    }
  }
}

.contact-form {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
  }

  .form-group {
    margin-bottom: var(--spacing-md);

    label {
      display: block;
      margin-bottom: var(--spacing-xs);
      color: var(--text-color);
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }

    textarea {
      resize: vertical;
    }
  }

  button {
    width: 100%;
    padding: 12px;
    font-size: 1.1rem;
  }
}

.faq-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h2 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    text-align: center;
  }
}

.faq-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.faq-item {
  h3 {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }

  p {
    color: var(--text-light);
    line-height: 1.6;
  }
}
</style>