<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

// 添加用户权限检查
const authStore = useAuthStore()

// 检查是否为老师用户
const isTeacher = computed(() => {
  return authStore.userInfo?.userRole === 1
})

const isExpanded = ref(false)
const showQRCode = ref(false)
const showFAQ = ref(false)
const showContactForm = ref(false)

// 绘画模式相关状态
const isDrawingExpanded = ref(false)
// 移除 showTeacherFAB
// const showTeacherFAB = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 绘画模式按钮展开/收起
const toggleDrawingExpand = () => {
  isDrawingExpanded.value = !isDrawingExpanded.value
}

// 显示绘画模式（发送事件给父组件）
const showDrawingMode = () => {
  // 发送自定义事件，让父组件处理绘图模式
  window.dispatchEvent(new CustomEvent('toggle-drawing-mode'))
  isDrawingExpanded.value = false
}

// 帮忙功能
const showHelp = () => {
  // 显示快捷键帮助对话框
  showHelpDialog.value = true
  isDrawingExpanded.value = false
}

// 添加帮助对话框状态
const showHelpDialog = ref(false)
// 截图功能
const takeScreenshot = async () => {
  try {
    const html2canvas = await import('html2canvas')
    
    // 隐藏所有工具栏
    const toolbar = document.querySelector('.drawing-toolbar') as HTMLElement
    const serviceFab = document.querySelector('.service-fab-container') as HTMLElement
    const originalToolbarDisplay = toolbar?.style.display
    const originalFabDisplay = serviceFab?.style.display
    
    if (toolbar) toolbar.style.display = 'none'
    if (serviceFab) serviceFab.style.display = 'none'
    
    const canvas = await html2canvas.default(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0
    })
    
    // 恢复工具栏显示
    if (toolbar && originalToolbarDisplay !== undefined) {
      toolbar.style.display = originalToolbarDisplay
    }
    if (serviceFab && originalFabDisplay !== undefined) {
      serviceFab.style.display = originalFabDisplay
    }
    
    // 如果有绘图画布，合并绘图内容
    const drawingCanvas = document.querySelector('.drawing-canvas') as HTMLCanvasElement
    if (drawingCanvas) {
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = canvas.width
      finalCanvas.height = canvas.height
      const finalCtx = finalCanvas.getContext('2d')
      
      if (finalCtx) {
        finalCtx.drawImage(canvas, 0, 0)
        finalCtx.drawImage(drawingCanvas, 0, 0)
        
        const link = document.createElement('a')
        link.download = `annotation_${new Date().getTime()}.png`
        link.href = finalCanvas.toDataURL('image/png')
        link.click()
      }
    } else {
      const link = document.createElement('a')
      link.download = `screenshot_${new Date().getTime()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    
    // 显示成功消息
  } catch (error) {
    console.error('截图失败:', error)
  }
  
  isDrawingExpanded.value = false
}

const toggleQRCode = () => {
  showQRCode.value = !showQRCode.value
  if (showQRCode.value) {
    showFAQ.value = false
    showContactForm.value = false
  }
}

const toggleFAQ = () => {
  showFAQ.value = !showFAQ.value
  if (showFAQ.value) {
    showQRCode.value = false
    showContactForm.value = false
  }
}

const toggleContactForm = () => {
  showContactForm.value = !showContactForm.value
  if (showContactForm.value) {
    showQRCode.value = false
    showFAQ.value = false
  }
}

const callPhone = () => {
  window.location.href = 'tel:+81123456789'
}
</script>

<template>
  <div class="service-fab-container">
    <!-- 绘画模式FAB按钮 -->
    <div v-if="isTeacher" :class="['drawing-fab', { 'expanded': isDrawingExpanded }]">
      <div class="fab-menu drawing-menu">
        <button class="fab-item" @click="takeScreenshot" title="截图">
          <i class="ri-camera-line"></i>
        </button>
        <button class="fab-item" @click="showDrawingMode" title="绘画模式">
          <i class="ri-pencil-line"></i>
        </button>
        <button class="fab-item" @click="showHelp" title="帮忙">
          <i class="ri-question-line"></i>
        </button>
      </div>
      
      <button class="fab-main drawing-main" @click="toggleDrawingExpand" title="绘画模式">
        <i class="ri-brush-line" v-if="!isDrawingExpanded"></i>
        <i class="ri-close-line" v-else></i>
      </button>
    </div>

    <!-- 客服中心FAB按钮 -->
    <div :class="['service-fab', { 'expanded': isExpanded }]">
      <button class="fab-main" @click="toggleExpand" title="客服中心">
        <i class="ri-customer-service-2-line" v-if="!isExpanded"></i>
        <i class="ri-close-line" v-else></i>
      </button>
      
      <div class="fab-menu">
        <button class="fab-item" @click="toggleQRCode" title="微信咨询">
          <i class="ri-wechat-line"></i>
        </button>
      </div>
    </div>
    
    <!-- QR Code Modal -->
    <div class="fab-modal qr-code" v-if="showQRCode">
      <div class="modal-content">
        <h3>微信咨询</h3>
        <img src="https://csry.oss-cn-beijing.aliyuncs.com/kfwx.jpg" alt="微信二维码" class="qr-image"/>
        <p>扫描二维码添加客服微信</p>
      </div>
    </div>
    
    <!-- FAQ Modal -->
    <div class="fab-modal faq" v-if="showFAQ">
      <div class="modal-content">
        <h3>常见问题</h3>
        <div class="faq-item" v-for="(item, index) in 3" :key="index">
          <div class="faq-question">如何准备JLPT考试？</div>
          <div class="faq-answer">我们提供针对JLPT各级别的专业备考课程，包括词汇、语法、听力和阅读等全方位训练。建议您根据自己的水平选择合适的课程进行系统学习。</div>
        </div>
        <button class="btn btn-primary">查看更多问题</button>
      </div>
    </div>
    
    <!-- Contact Form Modal -->
    <div class="fab-modal contact-form" v-if="showContactForm">
      <div class="modal-content">
        <h3>意见反馈</h3>
        <form>
          <div class="form-group">
            <label for="name">姓名</label>
            <input type="text" id="name" placeholder="请输入您的姓名">
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" placeholder="请输入您的邮箱">
          </div>
          <div class="form-group">
            <label for="message">反馈内容</label>
            <textarea id="message" rows="4" placeholder="请输入您的反馈内容"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">提交反馈</button>
        </form>
      </div>
    </div>
    <!-- 快捷键帮助对话框 -->
    <el-dialog
      v-model="showHelpDialog"
      title="绘图工具快捷键说明"
      width="400px"
      center
    >
      <div class="help-content">
        <div class="shortcut-item">
          <span class="key">B: </span>
          <span class="desc">画笔工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">T: </span>
          <span class="desc">文本工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">L: </span>
          <span class="desc">直线工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">A: </span>
          <span class="desc">箭头工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">R: </span>
          <span class="desc">矩形工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">C: </span>
          <span class="desc">圆形工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">E: </span>
          <span class="desc">橡皮擦工具</span>
        </div>
        <div class="shortcut-item">
          <span class="key">Ctrl+Z: </span>
          <span class="desc">撤销</span>
        </div>
        <div class="shortcut-item">
          <span class="key">Ctrl+Y: </span>
          <span class="desc">重做</span>
        </div>
        <div class="shortcut-item">
          <span class="key">Ctrl+S: </span>
          <span class="desc">保存截图</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showHelpDialog = false">关闭</el-button>
      </template>
    </el-dialog>
    <div class="modal-backdrop" v-if="showQRCode || showFAQ || showContactForm" @click="showQRCode = showFAQ = showContactForm = false"></div>
  </div>
</template>

<style lang="scss" scoped>
.service-fab-container {
  position: relative;
  z-index: 1000;
}

// 绘画模式FAB样式
.drawing-fab {
  position: fixed;
  right: 30px;
  bottom: calc(20vh + 85px); // 使用视口高度单位，确保相对间距
  display: none; // 手机端默认隐藏
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1001;
  
  // 桌面端显示
  @media (min-width: 768px) {
    display: flex;
  }
  
  // 响应式调整
  @media (max-height: 600px) {
    bottom: calc(25vh + 100px); // 小屏幕时调整间距
  }
  
  @media (max-height: 400px) {
    bottom: calc(30vh + 80px); // 极小屏幕时进一步调整
  }
}

// 客服中心
.service-fab {
  position: fixed;
  right: 30px;
  bottom: 15vh; // 使用视口高度单位替代固定百分比
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  
  // iPad特殊处理 - 避免与头部工具栏重叠
  @media (min-width: 768px) and (max-width: 1024px) {
    bottom: 12vh;
    right: 25px;
  }
  
  // iPad Mini横屏特殊处理
  @media (width: 768px) and (height: 1024px) {
    bottom: 10vh;
    right: 20px;
  }
  
  // 响应式调整
  @media (max-height: 600px) {
    bottom: 10vh; // 从12vh调整为10vh
  }
  
  @media (max-height: 400px) {
    bottom: 8vh; // 从10vh调整为8vh
  }
}

// 移动端特殊处理
@media (max-width: 768px) {
  .service-fab {
    right: 20px;
    bottom: 5vh; // 从12vh调整为8vh，向下移动按钮位置
  }
}

// 超小屏幕处理
@media (max-width: 480px) {
  .service-fab {
    right: 15px;
    bottom: 3vh; // 从15vh调整为6vh，进一步向下移动
  }
}
.drawing-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px); // 向上弹出，从下方移入
  transition: all var(--transition-normal);
  order: -1; // 确保菜单在按钮上方
}

.drawing-fab.expanded {
  .drawing-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .drawing-main {
    background-color: #e55a2b;
  }
}

.fab-main {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: scale(1.05);
  }
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-20px); // 向下弹出，从上方移入
  transition: all var(--transition-normal);
}

.fab-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }
  
  &:nth-child(1) {
    transition-delay: 0.1s;
  }
  
  &:nth-child(2) {
    transition-delay: 0.2s;
  }
  
  &:nth-child(3) {
    transition-delay: 0.3s;
  }
  
  &:nth-child(4) {
    transition-delay: 0.4s;
  }
}

// 绘画模式FAB的子按钮样式
.drawing-fab .fab-item {
  color: #ff6b35;
  border-color: #ff6b35;
}

.expanded {
  .fab-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .fab-main {
    background-color: var(--accent-color);
  }
}

.fab-modal {
  position: fixed;
  right: 90px;
  bottom: 20%;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 300px;
  max-width: calc(100vw - 120px);
  animation: slideInUp var(--transition-normal);
  z-index: 999;
  transform: translateY(-50%);
  max-height: 80vh;
  overflow-y: auto;
  
  @media (max-width: 767px) {
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%) !important;
    left: auto !important;
    top: auto !important;
    transition: opacity 0.3s ease, visibility 0.3s ease !important;
  }
  
  .modal-content {
    padding: var(--spacing-lg);
    
    h3 {
      margin-bottom: var(--spacing-md);
      color: var(--primary-color);
    }
  }
  
  &.qr-code {
    text-align: center;
    
    .qr-image {
      width: 180px;
      height: 180px;
      margin: 10px auto;
    }
  }
  
  &.faq {
    .faq-item {
      margin-bottom: var(--spacing-md);
      
      .faq-question {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }
      
      .faq-answer {
        color: var(--text-light);
        font-size: 0.95rem;
      }
    }
    
    button {
      margin-top: var(--spacing-sm);
      width: 100%;
    }
  }
  
  &.contact-form {
    .form-group {
      margin-bottom: var(--spacing-md);
      
      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        font-size: 0.9rem;
        color: var(--text-light);
      }
      
      input, textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-family: inherit;
        resize: none;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }
    
    button {
      width: 100%;
    }
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: fadeIn var(--transition-normal);
}
</style>


