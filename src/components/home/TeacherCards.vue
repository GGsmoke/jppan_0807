<template>
  <section class="teacher-section section">
    <div class="container">
      <h2 class="section-title">教师介绍</h2>
      <p class="section-subtitle">我们的教师团队拥有丰富的教学经验和专业知识，为您的日语学习提供专业的指导。</p>
      
      <div class="teachers-grid">
        <div 
          v-for="teacher in teachers" 
          :key="teacher.id"
          class="teacher-card"
          @click="navigateToTeacher(teacher)"
        >
          <div class="teacher-image">
            <img :src="teacher.image" :alt="teacher.name">
          </div>
          <div class="teacher-info">
            <h3 class="teacher-name">{{ teacher.name }}</h3>
            <p class="teacher-name-en">{{ teacher.nameEn }}</p>
            <p class="teacher-role">{{ teacher.role }}</p>
            <p class="teacher-description">{{ teacher.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="teachers-cta">
        <p>我们的教师团队随时准备为您提供专业的学习指导。</p>
        <router-link to="/courses" class="btn btn-primary">
          预约课程
          <i class="ri-arrow-right-line"></i>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { teachers } from '../../config/teachers'

const router = useRouter()

const navigateToTeacher = (teacher: any) => {
  sessionStorage.setItem('currentTeacher', JSON.stringify(teacher))
  router.push(`/teachers/${teacher.id}`)
}
</script>

<style lang="scss" scoped>
.teacher-section {
  background-color: white;
  padding: var(--spacing-xxl) 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.section-subtitle {
  text-align: center;
  color: var(--text-light);
  margin-bottom: var(--spacing-xl);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.teacher-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  position: relative;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    
    .teacher-image img {
      transform: scale(1.05);
    }
  }
}

.teacher-image {
  height: 380px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
  }
}

.teacher-info {
  padding: var(--spacing-lg);
}

.teacher-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.teacher-name-en {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: var(--spacing-sm);
}

.teacher-role {
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.teacher-description {
  color: var(--text-light);
  font-size: 0.95rem;
  line-height: 1.5;
}

.teachers-cta {
  text-align: center;
  margin-top: var(--spacing-xl);
  
  p {
    margin-bottom: var(--spacing-md);
    color: var(--text-light);
  }
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    
    i {
      transition: transform var(--transition-fast);
    }
    
    &:hover i {
      transform: translateX(4px);
    }
  }
}
</style>