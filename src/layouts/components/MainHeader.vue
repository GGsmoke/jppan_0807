<template>
  <header :class="['main-header', { 'scrolled': isScrolled }]">
    <div class="container">
      <div class="header-content">
        <button v-if="showBackButton" class="back-button" @click="goBack">
          <i class="ri-arrow-left-line"></i>
        </button>
        <div class="logo" @click="navigateTo('/')">
          <span class="logo-text">纯刷日语</span>
          <span class="logo-jp">为热爱日语的你，打造同频成长的学习聚落</span>
        </div>
        
        <nav class="desktop-nav">
          <ul>
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/gojuon">五十音</router-link></li>
            <li><router-link to="/vocabulary">单词</router-link></li>
            <li><router-link to="/grammar">语法</router-link></li>
            <li><router-link to="/practice">试题练习</router-link></li>
            <li><router-link to="/courses">课程</router-link></li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <template v-if="authStore.isLoggedIn">
            <div class="user-info">
              <el-dropdown trigger="click">
                <div class="user-avatar-wrapper">
                  <img src="https://csry.oss-cn-beijing.aliyuncs.com/108.png" alt="用户头像" class="user-avatar">
                  <span class="user-name">{{ authStore.userInfo?.userName }}</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="navigateTo('/profile')">
                      <i class="ri-user-line"></i>
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleLogout">
                      <i class="ri-logout-box-line"></i>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template v-else>
            <button class="login-btn" @click="navigateTo('/auth/login')">
              <i class="ri-user-line"></i>
              <span>登录</span>
            </button>
          </template>
          
          <button class="download-btn" @click="showDownloadDialog = true">
            <i class="ri-download-line"></i>
            <span>下载APP</span>
          </button>
          
          <!-- 老师模式工具栏 - 只在老师模式且移动端显示 -->
          <div v-if="isTeacherMode" class="teacher-tools">
            <button 
              :class="['tool-btn', { 'active': isDrawing }]" 
              @click="toggleDrawing"
              title="画笔工具"
            >
              <i class="ri-pencil-line"></i>
            </button>
            <button 
              class="tool-btn eraser" 
              @click="clearDrawing"
              title="清除画笔"
            >
              <i class="ri-eraser-line"></i>
            </button>
          </div>
          
          <button class="menu-toggle" @click="toggleMenu">
            <i :class="isMenuOpen ? 'ri-close-line' : 'ri-menu-line'"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div :class="['mobile-menu', { 'active': isMenuOpen }]">
      <ul>
        <li @click="navigateTo('/')">首页</li>
        <li @click="navigateTo('/gojuon')">五十音</li>
        <li @click="navigateTo('/vocabulary')">单词</li>
        <li @click="navigateTo('/grammar')">语法</li>
        <li @click="navigateTo('/practice')">试题练习</li>
        <li @click="navigateTo('/courses')">课程</li>
        <!-- 根据登录状态显示不同选项 -->
        <template v-if="authStore.isLoggedIn">
          <li class="mobile-user" @click="navigateTo('/profile')">
            个人中心
          </li>
          <li class="mobile-logout" @click="handleLogout">
            退出登录
          </li>
        </template>
        <!-- 移除未登录时的登录选项 -->
      </ul>
    </div>

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
  </header>
  
  <!-- 画笔画布 -->
  <canvas 
    v-if="isDrawing"
    ref="drawingCanvas"
    class="drawing-canvas"
    @mousedown="startDrawing"
    @mousemove="draw"
    @mouseup="stopDrawing"
    @mouseleave="stopDrawing"
    @touchstart="startDrawing"
    @touchmove="draw"
    @touchend="stopDrawing"
  ></canvas>
  
  <!-- 画笔模式关闭按钮 -->
  <button 
    v-if="isDrawing" 
    class="drawing-close-btn" 
    @click="closeDrawingMode"
    title="关闭画笔模式"
  >
    <i class="ri-close-line"></i>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const showDownloadDialog = ref(false)

// 老师模式状态
const isTeacherMode = ref(false)

// 画笔相关状态
const isDrawing = ref(false)
const isDrawingActive = ref(false)
const drawingCanvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0
// 添加保存滚动位置的变量
let savedScrollY = 0

const checkTeacherMode = () => {
  const teacherParam = route.query.teacher
  const isTeacherUser = authStore.userInfo?.userRole === 1 // or whatever number represents teacher role
  const teacherModeStorage = localStorage.getItem('teacherMode')
  
  isTeacherMode.value = !!(teacherParam || isTeacherUser || teacherModeStorage)
}

const showBackButton = computed(() => {
  return route.path !== '/'
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const navigateTo = (path: string) => {
  router.push(path)
  isMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  // 关闭移动端菜单
  isMenuOpen.value = false
  ElMessage({
    message: '已退出登录',
    type: 'success',
    duration: 1000
  })
  router.push('/')
}

const goBack = () => {
  router.back()
}

// 画笔功能
const toggleDrawing = () => {
  isDrawing.value = !isDrawing.value
  if (isDrawing.value) {
    // 保存当前滚动位置
    savedScrollY = window.scrollY
    
    // 禁止页面滚动和缩放，同时保持当前视图位置
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    // 禁止缩放
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    }
    
    nextTick(() => {
      setupCanvas()
    })
    ElMessage({
      message: '画笔模式已开启',
      type: 'success',
      duration: 1000
    })
  } else {
    // 恢复页面滚动和缩放
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.height = ''
    // 恢复滚动位置
    window.scrollTo(0, savedScrollY)
    // 恢复缩放
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
    }
    
    ElMessage({
      message: '画笔模式已关闭',
      type: 'info',
      duration: 1000
    })
  }
}

// 新增关闭画笔模式方法
const closeDrawingMode = () => {
  isDrawing.value = false
  // 恢复页面滚动和缩放
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.height = ''
  // 恢复滚动位置
  window.scrollTo(0, savedScrollY)
  // 恢复缩放
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
  }
  
  ElMessage({
    message: '画笔模式已关闭',
    type: 'info',
    duration: 1000
  })
}

const clearDrawing = () => {
  if (ctx && drawingCanvas.value) {
    ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
    ElMessage({
      message: '画笔内容已清除',
      type: 'success',
      duration: 1000
    })
  }
}

const setupCanvas = () => {
  if (!drawingCanvas.value) return
  
  const canvas = drawingCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.strokeStyle = '#ff4757'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }
}

const getEventPos = (e: MouseEvent | TouchEvent) => {
  const canvas = drawingCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  
  const rect = canvas.getBoundingClientRect()
  
  if (e instanceof MouseEvent) {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  } else {
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }
}

// 防止画笔模式下的默认触摸行为
const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!ctx) return
  
  e.preventDefault()
  e.stopPropagation()
  isDrawingActive.value = true
  
  const pos = getEventPos(e)
  lastX = pos.x
  lastY = pos.y
  
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
}

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawingActive.value || !ctx) return
  
  e.preventDefault()
  e.stopPropagation()
  
  const pos = getEventPos(e)
  
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  
  lastX = pos.x
  lastY = pos.y
}

const stopDrawing = () => {
  isDrawingActive.value = false
}

const handleResize = () => {
  if (drawingCanvas.value && isDrawing.value) {
    setupCanvas()
  }
}

// 在onMounted中添加老师模式检测
onMounted(() => {
  checkTeacherMode()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
  
  // 监听路由变化，重新检测老师模式
  router.afterEach(() => {
    checkTeacherMode()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: transparent;
  transition: all 0.3s ease;
  
  &.scrolled {
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    
    .logo-text, .logo-jp {
      color: var(--text-color);
    }
    
    .desktop-nav a {
      color: var(--text-color);
      
      &:hover, &.router-link-active {
        color: var(--primary-color);
      }
    }
  }
}

.back-button {
  position: fixed;
  top: 60px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  
  i {
    font-size: 1.2rem;
    color: var(--text-color);
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  
  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    transition: color 0.3s ease;
  }
  
  .logo-jp {
    font-size: 0.75rem;
    color: var(--text-color);
    opacity: 0.8;
    transition: color 0.3s ease;
  }
}

.desktop-nav {
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
  
  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      margin: 0 15px;
      
      a {
        color: var(--text-color);
        text-decoration: none;
        font-size: 0.95rem;
        transition: color 0.3s ease;
        
        &:hover, &.router-link-active {
          color: var(--primary-color);
        }
      }
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

// 老师工具栏样式 - 修改为只在移动端显示
.teacher-tools {
  display: flex; // 移动端默认显示
  align-items: center;
  gap: 4px;
  margin-right: var(--spacing-sm);
  
  // 桌面端隐藏 - 修改断点并添加iPad特殊处理
  @media (min-width: 769px) {
    display: none;
  }
  
  // iPad横屏特殊处理 - 确保在iPad横屏时也隐藏
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
    display: none;
  }
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background-color: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
  }
  
  &.eraser {
    &:hover {
      border-color: #ff4757;
      color: #ff4757;
    }
  }
}

// 画布样式
.drawing-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  pointer-events: auto;
  cursor: crosshair;
  touch-action: none; // 禁止触摸滚动和缩放
}

// 画笔模式关闭按钮
.drawing-close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s ease;
  
  i {
    font-size: 1.5rem;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.user-info {
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--background-color);
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  
  i {
    font-size: 1.1rem;
  }
}

.login-btn {
  display: flex;
  align-items: center;
  background-color: var(--primary-color);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  i {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: var(--primary-dark);
  }
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

.mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
  
  &.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    
    li {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.3s ease;
      color: var(--text-color);
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &.mobile-login {
        color: var(--primary-color);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        
        i {
          font-size: 1.1rem;
        }
      }
      
      &.mobile-user {
        color: var(--text-color);
      }
      
      &.mobile-logout {
        color: #ff4757;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
  
  @media (min-width: 768px) {
    display: none;
  }
}

.download-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .download-options {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) 0;
  }

  .download-option {
    flex: 1;
    text-align: center;

    h4 {
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
    }

    .qr-code {
      width: 120px;
      height: 120px;
      border-radius: var(--border-radius);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>