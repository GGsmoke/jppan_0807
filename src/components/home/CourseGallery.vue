<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { courses } from '../../config/courses'

const router = useRouter()
const activeFilter = ref('all')

const filters = [
  { id: 'all', label: '全部' },
  { id: 'N1', label: 'N1' },
  { id: 'N2', label: 'N2' },
  { id: 'N3', label: 'N3' },
  { id: 'N4', label: 'N4' },
  { id: 'N5', label: 'N5' }
]

const filteredCourses = computed(() => {
  if (activeFilter.value === 'all') {
    return courses
  }
  return courses.filter(course => course.level === activeFilter.value)
})

const setFilter = (filter: string) => {
  activeFilter.value = filter
}

const navigateToCourse = (courseId: string) => {
  router.push(`/courses/${courseId}`)
}
</script>

<template>
  <section class="course-gallery section">
    <div class="container">
      <h2 class="section-title">精品课程</h2>
      <p class="section-subtitle">教龄10年+名师团队研发制作课程 从初学者到高级水平，我们提供循序渐进的学习内容</p>
      
      <div class="course-filters">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          :class="['filter-btn', { active: activeFilter === filter.id }]"
          @click="setFilter(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <div class="courses-grid">
        <div 
          v-for="course in filteredCourses" 
          :key="course.id"
          class="course-card"
          @click="navigateToCourse(course.id)"
        >
          <div class="course-image">
            <img :src="course.image" :alt="course.title">
            <div class="course-level">{{ course.level }}</div>
            <div v-if="course.tag" :class="['course-tag', `tag-${course.tag}`]">
              {{ course.tag === 'popular' ? '热门' : '新课' }}
            </div>
          </div>
          
          <div class="course-content">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">{{ course.description }}</p>
            
            <div class="course-details">
              <div class="detail-item">
                <i class="ri-book-open-line"></i>
                <span>{{ course.lessons }}课时</span>
              </div>
              <div class="detail-item">
                <i class="ri-time-line"></i>
                <span>{{ course.duration }}</span>
              </div>
            </div>
            
            <div class="course-rating">
              <div class="stars">
                <i class="ri-star-fill" v-for="n in Math.floor(course.rating)" :key="n"></i>
                <i v-if="course.rating % 1 >= 0.5" class="ri-star-half-fill"></i>
              </div>
              <span class="rating-value">{{ course.rating }}</span>
              <span class="students-count">({{ course.students }}人已学)</span>
            </div>
            
            <div class="course-footer">
              <div class="course-price">¥{{ course.price.toLocaleString() }}</div>
              <button class="btn-course-details">
                课程详情
                <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="view-all-courses">
        <button class="btn btn-outlined" @click="router.push('/courses')">
          查看全部课程
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.course-gallery {
  background-color: var(--background-color);
  padding: var(--spacing-xxl) 0;
}

.course-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.filter-btn {
  background-color: white;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 30px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.95rem;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  &.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.course-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-md);
    
    .course-image img {
      transform: scale(1.05);
    }
  }
}

.course-image {
  position: relative;
  height: 180px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
  }
  
  .course-level {
    position: absolute;
    top: 15px;
    left: 15px;
    background-color: var(--primary-dark);
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .course-tag {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    
    &.tag-popular {
      background-color: var(--accent-color);
      color: white;
    }
    
    &.tag-new {
      background-color: var(--secondary-color);
      color: white;
    }
  }
}

.course-content {
  padding: var(--spacing-lg);
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
  height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; // 现代标准属性
  -webkit-box-orient: vertical;
  box-orient: vertical; // 现代标准属性
}

.course-details {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  
  .detail-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: var(--text-light);
    
    i {
      margin-right: 5px;
      font-size: 1rem;
    }
  }
}

.course-rating {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  .stars {
    display: flex;
    color: #FFD700;
    margin-right: 5px;
  }
  
  .rating-value {
    font-weight: 500;
    margin-right: 5px;
  }
  
  .students-count {
    font-size: 0.9rem;
    color: var(--text-light);
  }
}

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.course-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.btn-course-details {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  font-size: 0.95rem;
  
  i {
    margin-left: 5px;
    transition: transform var(--transition-fast);
  }
  
  &:hover {
    i {
      transform: translateX(4px);
    }
  }
}

.view-all-courses {
  text-align: center;
  margin-top: var(--spacing-xl);
}
</style>