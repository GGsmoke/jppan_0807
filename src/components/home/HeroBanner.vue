<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface SlideItem {
  title: string
  subtitle: string
  image: string
  buttonText: string
  buttonLink: string
}

const slides = ref<SlideItem[]>([
  {
    title: '陪你解锁每一步进阶',
    subtitle: '教龄10年+名师团队研发 课程+刷题库+单词库+语法库',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/csry_index_1.jpeg',
    buttonText: '浏览课程',
    buttonLink: '/courses'
  },
  {
    title: '每道题都为你的进步铺路',
    subtitle: 'N5到N1万道真题模拟题 越刷越爽 越爽越提分',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/csry_index_2.jpeg',
    buttonText: '立即开始',
    buttonLink: '/practice'
  },
  {
    title: '两万词伴你开口，六万句教你地道',
    subtitle: '量大的词库背起来才过瘾',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/csry_index_3.jpg',
    buttonText: '开始学习',
    buttonLink: '/vocabulary'
  }
])

const currentSlide = ref(0)
const isTransitioning = ref(false)

const nextSlide = () => {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
  setTimeout(() => {
    isTransitioning.value = false
  }, 500)
}

const prevSlide = () => {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
  setTimeout(() => {
    isTransitioning.value = false
  }, 500)
}

const navigateToPage = (path: string) => {
  router.push(path)
}

const autoPlay = ref<number | null>(null)

const startAutoPlay = () => {
  autoPlay.value = setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoPlay = () => {
  if (autoPlay.value) {
    clearInterval(autoPlay.value)
  }
}

onMounted(() => {
  startAutoPlay()
})
</script>

<template>
  <div 
    class="hero-banner" 
    @mouseenter="stopAutoPlay" 
    @mouseleave="startAutoPlay"
  >
    <div class="slides-container">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        :class="['slide', { active: index === currentSlide }]"
        :style="{ backgroundImage: `url(${slide.image})` }"
      >
        <div class="slide-content">
          <h1 class="slide-title" v-html="slide.title"></h1>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <button class="btn btn-primary" @click="navigateToPage(slide.buttonLink)">
            {{ slide.buttonText }}
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="slide-controls">
      <button class="control-btn prev" @click="prevSlide">
        <i class="ri-arrow-left-s-line"></i>
      </button>
      <div class="slide-indicators">
        <button 
          v-for="(slide, index) in slides" 
          :key="index"
          :class="['indicator', { active: index === currentSlide }]"
          @click="currentSlide = index"
        ></button>
      </div>
      <button class="control-btn next" @click="nextSlide">
        <i class="ri-arrow-right-s-line"></i>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero-banner {
  position: relative;
  height: 600px;
  overflow: hidden;
  
  @media (max-width: 767px) {
    height: 450px;
  }
}

.slides-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3));
  }
  
  &.active {
    opacity: 1;
    z-index: 1;
    
    .slide-title {
      transform: translateY(0);
      opacity: 1;
    }
    
    .slide-subtitle {
      transform: translateY(0);
      opacity: 1;
    }
    
    .btn {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

.slide-content {
  position: relative;
  z-index: 2;
  color: white;
  max-width: 600px;
  padding: 0 20px;
  margin-left: 10%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 767px) {
    margin-left: 5%;
  }
}

.slide-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease;
  
  @media (max-width: 767px) {
    font-size: 2rem;
  }
  
  .text-primary {
    color: var(--primary-light);
  }
  
  .text-secondary {
    color: var(--secondary-color);
  }
  
  .text-accent {
    color: var(--accent-color);
  }
}

.slide-subtitle {
  font-size: 1.2rem;
  margin-bottom: 30px;
  max-width: 80%;
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.6s ease 0.1s, opacity 0.6s ease 0.1s;
  
  @media (max-width: 767px) {
    font-size: 1rem;
  }
}

.btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  font-size: 1rem;
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.6s ease 0.2s, opacity 0.6s ease 0.2s;
  
  i {
    margin-left: 8px;
    transition: transform var(--transition-fast);
  }
  
  &:hover {
    i {
      transform: translateX(4px);
    }
  }
}

.slide-controls {
  position: absolute;
  left: 0;
  bottom: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.control-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 1.5rem;
  
  &:hover {
    background-color: var(--primary-color);
  }
}

.slide-indicators {
  display: flex;
  align-items: center;
  margin: 0 20px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  margin: 0 5px;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &.active {
    background-color: white;
    transform: scale(1.2);
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
</style>