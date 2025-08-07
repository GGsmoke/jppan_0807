<template>
  <div class="teacher-detail">
    <div class="page-header">
      <div class="container">
        <h1>教师介绍</h1>
      </div>
    </div>

    <div class="container">
      <div class="teacher-profile">
        <div class="profile-header">
          <div class="profile-avatar">
            <img :src="teacher?.image" :alt="teacher?.name">
          </div>
          <div class="profile-info">
            <h2>{{ teacher?.name }}</h2>
            <p class="name-en">{{ teacher?.nameEn }}</p>
            <div class="role-badge">{{ teacher?.role }}</div>
          </div>
        </div>

        <div class="profile-content">
          <div class="content-section">
            <h3>个人简介</h3>
            <p>{{ teacher?.description }}</p>
          </div>

          <div class="content-section">
            <h3>专业领域</h3>
            <div class="expertise-tags">
              <span v-for="(item, index) in teacher?.expertise" :key="index" class="tag">
                {{ item }}
              </span>
            </div>
          </div>

          <div class="content-section">
            <h3>教育背景</h3>
            <ul class="education-list">
              <li v-for="(item, index) in teacher?.education" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="content-section">
            <h3>工作经历</h3>
            <ul class="experience-list">
              <li v-for="(item, index) in teacher?.experience" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="content-section">
            <h3>语言能力</h3>
            <div class="language-badges">
              <div v-for="(lang, index) in teacher?.languages" :key="index" class="language-badge">
                <span class="language-name">{{ lang.language }}</span>
                <span class="language-level">{{ lang.level }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <button class="btn-contact" @click="showContactDialog = true">
            <i class="ri-message-3-line"></i>
            联系老师
          </button>
        </div>
      </div>
    </div>

    <!-- Contact Dialog -->
    <el-dialog
      v-model="showContactDialog"
      title="联系老师"
      width="360px"
      center
      :show-close="false"
      class="contact-dialog"
    >
      <div class="qr-container">
        <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="老师微信二维码" class="qr-code">
        <p>扫码添加老师微信</p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showContactDialog = ref(false)

interface Language {
  language: string
  level: string
}

interface Teacher {
  id: string
  name: string
  nameEn: string
  role: string
  image: string
  description: string
  expertise: string[]
  education: string[]
  experience: string[]
  languages: Language[]
}

const teacher = ref<Teacher | null>(null)

onMounted(() => {
  // Get teacher data from sessionStorage
  const storedTeacher = sessionStorage.getItem('currentTeacher')
  if (storedTeacher) {
    teacher.value = JSON.parse(storedTeacher)
  } else {
    // If no data in sessionStorage, go back to home page
    router.push('/')
  }
})
</script>

<style lang="scss" scoped>
.teacher-detail {
  padding-bottom: var(--spacing-xxl);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: 2rem;
  }
}

.teacher-profile {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.profile-header {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.profile-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--primary-color);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile-info {
  h2 {
    font-size: 2rem;
    margin-bottom: var(--spacing-xs);
  }

  .name-en {
    font-size: 1.2rem;
    color: var(--text-light);
    margin-bottom: var(--spacing-sm);
  }

  .role-badge {
    display: inline-block;
    background-color: var(--primary-color);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: 500;
  }
}

.content-section {
  margin-bottom: var(--spacing-xl);

  h3 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-md);
    color: var(--primary-color);

    &::after {
      content: '';
      display: block;
      width: 40px;
      height: 3px;
      background-color: var(--primary-color);
      margin-top: 8px;
    }
  }

  p {
    color: var(--text-light);
    line-height: 1.8;
  }
}

.expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);

  .tag {
    background-color: var(--background-color);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
  }
}

.education-list,
.experience-list {
  list-style: none;
  padding: 0;

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);

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

.language-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.language-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--background-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);

  .language-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .language-level {
    font-size: 0.9rem;
    color: var(--text-light);
  }
}

.profile-actions {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.btn-contact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
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