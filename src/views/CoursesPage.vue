<template>
  <div class="courses-page">
    <div class="page-header">
      <div class="container">
        <h1>课程列表</h1>
        <p>为您提供适合您水平的日语学习课程</p>
      </div>
    </div>

    <div class="container">
      <div class="courses-filters">
        <div class="filter-group">
          <label>等级</label>
          <div class="filter-buttons">
            <button 
              v-for="level in levels"
              :key="level"
              :class="['filter-btn', { active: currentLevel === level }]"
              @click="filterCourses('level', level)"
            >
              {{ level }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>分类</label>
          <div class="filter-buttons">
            <button 
              v-for="type in types"
              :key="type"
              :class="['filter-btn', { active: currentType === type }]"
              @click="filterCourses('type', type)"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>排序</label>
          <select class="sort-select" v-model="currentSort" @change="sortCourses">
            <option value="popular">按人气</option>
            <option value="new">最新</option>
            <option value="price-low">价格从低到高</option>
            <option value="price-high">价格从高到低</option>
          </select>
        </div>
      </div>

      <div class="courses-grid">
        <div 
          v-for="course in filteredAndSortedCourses" 
          :key="course.id"
          class="course-card"
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
                <i class="ri-time-line"></i>
                <span>{{ course.duration }}</span>
              </div>
              <div class="detail-item">
                <i class="ri-book-open-line"></i>
                <span>{{ course.lessons }}课时</span>
              </div>
              <div class="detail-item">
                <i class="ri-user-line"></i>
                <span>{{ course.students }}人学习</span>
              </div>
            </div>

            <div class="course-rating">
              <div class="stars">
                <i class="ri-star-fill" v-for="n in Math.floor(course.rating)" :key="n"></i>
                <i v-if="course.rating % 1 >= 0.5" class="ri-star-half-fill"></i>
              </div>
              <span class="rating-value">{{ course.rating }}</span>
              <span class="reviews-count">({{ course.students }}人已学)</span>
            </div>

            <div class="course-footer">
              <div class="course-price">¥{{ course.price.toLocaleString() }}</div>
              <button class="btn-enroll" @click="showEnrollModal = true">
                报名
                <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <button class="page-btn prev" :disabled="currentPage === 1" @click="prevPage">
          <i class="ri-arrow-left-s-line"></i>
          上一页
        </button>
        <div class="page-numbers">
          <button 
            v-for="pageNum in displayedPages" 
            :key="pageNum"
            :class="['page-number', { active: currentPage === pageNum }]"
            @click="currentPage = pageNum"
          >
            {{ pageNum }}
          </button>
          <span v-if="showEllipsis" class="page-dots">...</span>
          <button 
            v-if="showLastPage"
            :class="['page-number', { active: currentPage === totalPages }]"
            @click="currentPage = totalPages"
          >
            {{ totalPages }}
          </button>
        </div>
        <button class="page-btn next" :disabled="currentPage === totalPages" @click="nextPage">
          下一页
          <i class="ri-arrow-right-s-line"></i>
        </button>
      </div>
    </div>

    <!-- Enroll Dialog -->
    <el-dialog
      v-model="showEnrollModal"
      title="课程报名"
      width="360px"
      center
      :show-close="false"
      class="enroll-dialog"
    >
      <div class="qr-container">
        <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="客服二维码" class="qr-code">
        <p>扫码添加客服微信，完成报名</p>
      </div>
    </el-dialog>

    <!-- Download Dialog -->
    <el-dialog
      v-model="showDownloadDialog"
      title="下载纯刷日语APP"
      width="360px"
      center
      :show-close="false"
      class="download-dialog"
    >
      <div class="download-options">
        <div class="download-option">
          <h4>安卓</h4>
          <img 
            src="https://csry.oss-cn-beijing.aliyuncs.com/csry_android.png" 
            alt="Android版二维码" 
            class="qr-code"
          >
        </div>
        <div class="download-option">
          <h4>苹果</h4>
          <img 
            src="https://csry.oss-cn-beijing.aliyuncs.com/csry_ios.png" 
            alt="iOS版二维码" 
            class="qr-code"
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDownloadDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { courses } from '../config/courses'

const router = useRouter()
const currentLevel = ref('全部')
const currentType = ref('全部')
const currentSort = ref('popular')
const currentPage = ref(1)
const itemsPerPage = 6
const showEnrollModal = ref(false)
const showDownloadDialog = ref(false)

const levels = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']
const types = ['全部', '语法', '会话', '阅读', '听力']

const filterCourses = (filterType: string, value: string) => {
  if (filterType === 'level') {
    currentLevel.value = value
  } else if (filterType === 'type') {
    currentType.value = value
  }
  currentPage.value = 1
}

const filteredCourses = computed(() => {
  let filtered = courses

  if (currentLevel.value !== '全部') {
    filtered = filtered.filter(course => course.level === currentLevel.value)
  }

  if (currentType.value !== '全部') {
    filtered = filtered.filter(course => course.type === currentType.value)
  }

  return filtered
})

const filteredAndSortedCourses = computed(() => {
  let sorted = [...filteredCourses.value]

  switch (currentSort.value) {
    case 'popular':
      sorted.sort((a, b) => b.students - a.students)
      break
    case 'new':
      sorted.sort((a, b) => (b.tag === 'new' ? 1 : 0) - (a.tag === 'new' ? 1 : 0))
      break
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price)
      break
  }

  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sorted.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCourses.value.length / itemsPerPage))

const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(start + maxVisiblePages - 1, totalPages.value)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const showEllipsis = computed(() => {
  return totalPages.value > displayedPages.value[displayedPages.value.length - 1] + 1
})

const showLastPage = computed(() => {
  return totalPages.value > displayedPages.value[displayedPages.value.length - 1]
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const downloadApp = () => {
  showEnrollModal.value = false
  showDownloadDialog.value = true
}
</script>

<style lang="scss" scoped>
.courses-page {
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

.courses-filters {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.filter-group {
  flex: 1;
  min-width: 200px;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
  }
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;

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

.sort-select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.95rem;
  color: var(--text-color);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.course-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);

    .course-image img {
      transform: scale(1.05);
    }
  }
}

.course-image {
  position: relative;
  height: 200px;
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
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.course-description {
  color: var(--text-light);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  height: 3em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-details {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);

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
    color: #FFD700;
    margin-right: 5px;
  }

  .rating-value {
    font-weight: 500;
    margin-right: 5px;
  }

  .reviews-count {
    font-size: 0.9rem;
    color: var(--text-light);
  }
}

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.btn-enroll {
  display: flex;
  align-items: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);

  i {
    margin-left: 5px;
    transition: transform var(--transition-fast);
  }

  &:hover {
    background-color: var(--primary-dark);

    i {
      transform: translateX(3px);
    }
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.page-btn {
  display: flex;
  align-items: center;
  background: none;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.prev i {
    margin-right: 5px;
  }

  &.next i {
    margin-left: 5px;
  }
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: none;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(.active) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.page-dots {
  color: var(--text-light);
}

.enroll-dialog,
.download-dialog {
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

  .download-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
  }

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: white;
    font-weight: 500;
    transition: opacity var(--transition-fast);

    &:hover {
      opacity: 0.9;
    }

    i {
      font-size: 1.2rem;
    }

    &.android {
      background-color: #3DDC84;
    }

    &.ios {
      background-color: #000000;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
.download-btn {
  display: none;
  align-items: center;
  background-color: var(--accent-color);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  @media (min-width: 768px) {
    display: flex;
  }
  
  i {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: var(--accent-dark);
  }
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    display: none;
  }
}
</style>