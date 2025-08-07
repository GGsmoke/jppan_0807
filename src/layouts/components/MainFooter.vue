<template>
  <footer class="main-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <div class="logo-text">纯刷日语</div>
            <div class="logo-jp">为热爱日语的你，打造同频成长的学习聚落</div>
          </div>
          <p class="footer-description">
            教龄10年+名师团队研发 课程+刷题库+单词库+语法库
          </p>
        </div>
        
        <div class="footer-links">
          <div class="footer-links-group">
            <h4>课程</h4>
            <ul>
              <li><router-link to="/courses/n5">JLPT N5</router-link></li>
              <li><router-link to="/courses/n4">JLPT N4</router-link></li>
              <li><router-link to="/courses/n3">JLPT N3</router-link></li>
              <li><router-link to="/courses/n2">JLPT N2</router-link></li>
              <li><router-link to="/courses/n1">JLPT N1</router-link></li>
            </ul>
          </div>
          
          <div class="footer-links-group">
            <h4>学习</h4>
            <ul>
              <li><router-link to="/Practice">刷题</router-link></li>
              <li><router-link to="/vocabulary">单词</router-link></li>
              <li><router-link to="/grammar">语法</router-link></li>
              <!--
              <li><router-link to="/conversation">会话</router-link></li>
              <li><router-link to="/listening">听力</router-link></li>
              <li><router-link to="/reading">阅读</router-link></li>
              -->
            </ul>
          </div>
          
          <div class="footer-links-group">
            <h4>支持</h4>
            <ul>
              <!--
              <li><router-link to="/contact">联系我们</router-link></li>
              <li><router-link to="/faq">常见问题</router-link></li>
              <li><router-link to="/study-method">学习方法</router-link></li>
              -->
              <li><router-link to="/privacy">隐私政策</router-link></li>
              <li><router-link to="/terms">使用条款</router-link></li>
              <li><router-link to="/Xieyi">付费协议</router-link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="copyright">
          &copy; {{ currentYear }} 纯刷日语. 保留所有权利。
          <a href="https://beian.miit.gov.cn/" target="_blank">ICP证:辽ICP备2024031305号-3</a>
          <a target="_blank" href=" " style="color: #888888;font-size: 12px;">
            <img src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png" alt="公安备案图标" class="police-icon" />
            辽公网安备21029602001036号
          </a>
        </div>
        
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentYear = new Date().getFullYear()
</script>

<style lang="scss" scoped>
.main-footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 50px 0 20px;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 40px;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
}

.footer-info {
  flex: 1;
  
  .footer-logo {
    margin-bottom: 15px;
    
    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .logo-jp {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
  
  .footer-description {
    line-height: 1.6;
    color: #b8c4d0;
    max-width: 400px;
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 30px;
  flex: 2;
  
  .footer-links-group {
    h4 {
      color: #ecf0f1;
      font-size: 1.1rem;
      margin-bottom: 15px;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 30px;
        height: 2px;
        background-color: var(--primary-color);
      }
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        margin-bottom: 10px;
        
        a {
          color: #b8c4d0;
          text-decoration: none;
          transition: color 0.3s ease;
          
          &:hover {
            color: var(--accent-color);
          }
        }
      }
    }
  }
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .copyright {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin-bottom: 15px;
    
    @media (min-width: 768px) {
      margin-bottom: 0;
    }
    
    a {
      color: #7f8c8d;
      margin-left: 10px;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .police-icon {
      vertical-align: middle;
      margin-right: 5px;
      height: 14px;
    }
  }
  
  .social-links {
    display: flex;
    gap: 15px;
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      color: #ecf0f1;
      text-decoration: none;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: var(--primary-color);
      }
    }
  }
}
</style>