<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElSlider, ElColorPicker, ElMessageBox } from 'element-plus'

// 禁用滚动和缩放相关函数
const preventDefaultEvent = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const preventWheelEvent = (e: WheelEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const preventTouchMove = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    // 防止双指缩放
    e.preventDefault()
  }
}

const preventKeyboardZoom = (e: KeyboardEvent) => {
  // 防止Ctrl/Cmd + +/-/0 缩放
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=' || e.key === '_')) {
    e.preventDefault()
  }
}

// 添加保存滚动位置的变量
let savedScrollPosition = 0

// 禁用页面滚动和缩放
const disablePageInteraction = () => {
  // 保存当前滚动位置
  savedScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  // 禁用滚轮
  document.addEventListener('wheel', preventWheelEvent, { passive: false })
  window.addEventListener('wheel', preventWheelEvent, { passive: false })
  
  // 禁用触摸滚动和缩放
  document.addEventListener('touchmove', preventTouchMove, { passive: false })
  document.addEventListener('touchstart', preventTouchMove, { passive: false })
  
  // 禁用键盘缩放
  document.addEventListener('keydown', preventKeyboardZoom, { passive: false })
  
  // 禁用右键菜单
  document.addEventListener('contextmenu', preventDefaultEvent)
  
  // 设置body样式防止滚动，但保持当前位置
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.height = '100%'
  document.body.style.top = `-${savedScrollPosition}px`  // 使用负值保持当前位置
  document.body.style.left = '0'
  
  // 防止页面缩放的meta标签设置
  let viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.setAttribute('name', 'viewport')
    document.head.appendChild(viewport)
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
}

// 恢复页面滚动和缩放
const enablePageInteraction = () => {
  // 移除事件监听器
  document.removeEventListener('wheel', preventWheelEvent)
  window.removeEventListener('wheel', preventWheelEvent)
  document.removeEventListener('touchmove', preventTouchMove)
  document.removeEventListener('touchstart', preventTouchMove)
  document.removeEventListener('keydown', preventKeyboardZoom)
  document.removeEventListener('contextmenu', preventDefaultEvent)
  
  // 恢复body样式
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.height = ''
  document.body.style.top = ''
  document.body.style.left = ''
  
  // 恢复到之前的滚动位置
  window.scrollTo(0, savedScrollPosition)
  
  // 恢复viewport设置
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
  }
}

// 自动隐藏相关状态
const autoHideTimer = ref<NodeJS.Timeout | null>(null)
const isHovering = ref(false)
const autoHideDelay = 5000 // 5秒

// 重置自动隐藏定时器
const resetAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
  }
  if (isDrawing.value && isToolbarVisible.value && !isHovering.value) {
    autoHideTimer.value = setTimeout(() => {
      if (!isHovering.value && isDrawing.value) {
        isToolbarVisible.value = false
      }
    }, autoHideDelay)
  }
}

// 停止自动隐藏定时器
const stopAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
}

// 处理工具栏鼠标进入
const handleToolbarMouseEnter = () => {
  isHovering.value = true
  stopAutoHideTimer()
  if (isDrawing.value) {
    isToolbarVisible.value = true
  }
}

// 处理工具栏鼠标离开
const handleToolbarMouseLeave = () => {
  isHovering.value = false
  resetAutoHideTimer()
}

// 处理工具栏区域鼠标进入（包括隐藏状态）
const handleToolbarAreaMouseEnter = () => {
  if (isDrawing.value && !isToolbarVisible.value) {
    isToolbarVisible.value = true
    isHovering.value = true
    stopAutoHideTimer()
  }
}

// 处理任何工具栏操作
const handleToolbarActivity = () => {
  resetAutoHideTimer()
}

// 移动端检测相关
const isMobile = ref(false)
const touchSupported = ref(false)

// 检测设备类型
const detectDevice = () => {
  isMobile.value = window.innerWidth <= 768
  touchSupported.value = 'ontouchstart' in window
}

// 基础状态
const isExpanded = ref(false)
const isDrawing = ref(false)
const isDrawingActive = ref(false)
const drawingCanvas = ref<HTMLCanvasElement | null>(null)
const textInput = ref<HTMLInputElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// 工具栏显示状态
const isToolbarVisible = ref(true)
const showToolbar = ref(false)

// 拖动相关状态
const isDragging = ref(false)
// 修改工具栏默认位置为左侧居中
const toolbarPosition = ref({ x: 20, y: window.innerHeight / 2 - 10 })
const dragOffset = ref({ x: 0, y: 0 })

// 绘图工具状态
const currentTool = ref('pen') // pen, text, line, arrow, rectangle, circle, eraser
const brushSize = ref(3)
const brushColor = ref('#ff0000') // 改为红色
const brushOpacity = ref(1)
const eraserSize = ref(10)
const showMoreTools = ref(false)

// 文本工具状态
const isSelectingTextArea = ref(false)
const textAreaSelection = ref({ x: 0, y: 0, width: 0, height: 0 })
const activeTextInput = ref({
  show: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  value: ''
})

// 文本拖拽相关状态
const isDraggingText = ref(false)
const draggedTextElement = ref<any>(null)
const textElements = ref<Array<{id: string, x: number, y: number, text: string, fontSize: number, fontWeight: string, fontStyle: string, color: string}>>([])

// 绘图历史记录（撤销/重做）
const drawingHistory = ref<ImageData[]>([])
const historyIndex = ref(-1)
const maxHistorySteps = 15

// 绘图状态
let isDrawingShape = false
let startX = 0
let startY = 0
let lastX = 0
let lastY = 0

// 页面变换状态
const pageOffset = ref({ x: 0, y: 0 })
const pageScale = ref(1)

// 颜色选项
const colorOptions = [
  '#000000', // 黑色
  '#ff4757', // 红色
  '#3742fa', // 蓝色
  '#2ed573', // 绿色
  '#ffa502', // 橙色
  '#ff6348', // 珊瑚色
  '#a4b0be', // 灰色
  '#5f27cd'  // 紫色
]

// 主悬浮按钮展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 工具栏隐藏/显示
const toggleToolbar = () => {
  isToolbarVisible.value = !isToolbarVisible.value
  if (isToolbarVisible.value) {
    resetAutoHideTimer()
  } else {
    stopAutoHideTimer()
  }
}

// 更新页面变换信息
const updatePageTransform = () => {
  pageOffset.value = {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  }
  pageScale.value = window.devicePixelRatio || 1
}

// 保存绘图状态到历史记录
const saveToHistory = () => {
  if (!ctx || !drawingCanvas.value) return
  
  const imageData = ctx.getImageData(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
  
  // 移除当前索引之后的历史记录
  drawingHistory.value = drawingHistory.value.slice(0, historyIndex.value + 1)
  
  // 添加新的历史记录
  drawingHistory.value.push(imageData)
  
  // 限制历史记录数量
  if (drawingHistory.value.length > maxHistorySteps) {
    drawingHistory.value.shift()
  } else {
    historyIndex.value++
  }
}

// 撤销操作
const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const imageData = drawingHistory.value[historyIndex.value]
    if (ctx && imageData) {
      ctx.putImageData(imageData, 0, 0)
    }
  }
}

// 重做操作
const redo = () => {
  if (historyIndex.value < drawingHistory.value.length - 1) {
    historyIndex.value++
    const imageData = drawingHistory.value[historyIndex.value]
    if (ctx && imageData) {
      ctx.putImageData(imageData, 0, 0)
    }
  }
}

// 切换绘图模式
const toggleDrawing = () => {
  isDrawing.value = !isDrawing.value
  isExpanded.value = false
  
  if (isDrawing.value) {
    // 禁用页面交互
    disablePageInteraction()
    updatePageTransform()
    nextTick(() => {
      setupCanvas()
      showToolbar.value = true
      isToolbarVisible.value = true
      resetAutoHideTimer()
    })
    ElMessage({
      message: '绘图模式已开启，页面滚动和缩放已禁用',
      type: 'success',
      duration: 2000
    })
  } else {
    // 恢复页面交互
    enablePageInteraction()
    showToolbar.value = false
    isToolbarVisible.value = false
    activeTextInput.value.show = false
    stopAutoHideTimer()
    ElMessage({
      message: '绘图模式已关闭，页面交互已恢复',
      type: 'info',
      duration: 1000
    })
  }
}

// 清除所有绘图
const clearDrawing = () => {
  if (ctx && drawingCanvas.value) {
    ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
    saveToHistory()
    ElMessage({
      message: '画布已清空',
      type: 'success',
      duration: 1000
    })
  }
  isExpanded.value = false
}

// 设置画布
const setupCanvas = () => {
  if (!drawingCanvas.value) return
  
  const canvas = drawingCanvas.value
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.zIndex = '1000'
  
  ctx = canvas.getContext('2d')
  if (ctx) {
    updateBrushSettings()
    saveToHistory()
  }
}

// 更新画笔设置
const updateBrushSettings = () => {
  if (!ctx) return
  
  ctx.strokeStyle = brushColor.value
  ctx.lineWidth = currentTool.value === 'eraser' ? eraserSize.value : brushSize.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalAlpha = brushOpacity.value
  
  if (currentTool.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
  } else {
    ctx.globalCompositeOperation = 'source-over'
  }
}

// 获取事件坐标
const getEventPos = (e: MouseEvent | TouchEvent) => {
  const canvas = drawingCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  
  let clientX, clientY
  
  if (e instanceof MouseEvent) {
    clientX = e.clientX
    clientY = e.clientY
  } else {
    const touch = e.touches[0] || e.changedTouches[0]
    clientX = touch.clientX
    clientY = touch.clientY
  }
  
  return {
    x: clientX,
    y: clientY
  }
}

// 开始绘图
const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!ctx) return
  
  e.preventDefault()
  updatePageTransform()
  updateBrushSettings()
  
  const pos = getEventPos(e)
  startX = pos.x
  startY = pos.y
  lastX = pos.x
  lastY = pos.y
  
  if (currentTool.value === 'text') {
    startTextAreaSelection(pos.x, pos.y)
  } else if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    isDrawingActive.value = true
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
  } else {
    isDrawingShape = true
  }
}

// 绘图过程
const draw = (e: MouseEvent | TouchEvent) => {
  if (!ctx) return
  
  e.preventDefault()
  const pos = getEventPos(e)
  
  if (currentTool.value === 'text' && isSelectingTextArea.value) {
    updateTextAreaSelection(pos.x, pos.y)
  } else if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    if (!isDrawingActive.value) return
    
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    
    lastX = pos.x
    lastY = pos.y
  } else if (isDrawingShape) {
    const imageData = drawingHistory.value[historyIndex.value]
    if (imageData) {
      ctx.putImageData(imageData, 0, 0)
    }
    
    drawShape(startX, startY, pos.x, pos.y)
  }
}

// 绘制形状
const drawShape = (x1: number, y1: number, x2: number, y2: number) => {
  if (!ctx) return
  
  updateBrushSettings()
  ctx.beginPath()
  
  switch (currentTool.value) {
    case 'line':
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      break
    case 'arrow':
      drawArrow(x1, y1, x2, y2)
      break
    case 'rectangle':
      ctx.rect(x1, y1, x2 - x1, y2 - y1)
      break
    case 'circle':
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      ctx.arc(x1, y1, radius, 0, 2 * Math.PI)
      break
  }
  
  ctx.stroke()
}

// 绘制箭头
const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
  if (!ctx) return
  
  const headLength = 15
  const angle = Math.atan2(y2 - y1, x2 - x1)
  
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  
  ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6))
}

// 结束绘图
const stopDrawing = () => {
  if (currentTool.value === 'text' && isSelectingTextArea.value) {
    finishTextAreaSelection()
  } else if (isDrawingActive.value || isDrawingShape) {
    saveToHistory()
  }
  
  isDrawingActive.value = false
  isDrawingShape = false
}

// 文本工具相关函数
const startTextAreaSelection = (x: number, y: number) => {
  isSelectingTextArea.value = true
  textAreaSelection.value = { x, y, width: 0, height: 0 }
}

const updateTextAreaSelection = (x: number, y: number) => {
  if (!isSelectingTextArea.value) return
  
  textAreaSelection.value.width = x - textAreaSelection.value.x
  textAreaSelection.value.height = y - textAreaSelection.value.y
  // 移除虚框绘制代码
}


const finishTextAreaSelection = () => {
  isSelectingTextArea.value = false
  
  const minWidth = 100
  const minHeight = 30
  
  if (Math.abs(textAreaSelection.value.width) < minWidth) {
    textAreaSelection.value.width = textAreaSelection.value.width >= 0 ? minWidth : -minWidth
  }
  if (Math.abs(textAreaSelection.value.height) < minHeight) {
    textAreaSelection.value.height = textAreaSelection.value.height >= 0 ? minHeight : -minHeight
  }
  
  const x = textAreaSelection.value.width >= 0 ? textAreaSelection.value.x : textAreaSelection.value.x + textAreaSelection.value.width
  const y = textAreaSelection.value.height >= 0 ? textAreaSelection.value.y : textAreaSelection.value.y + textAreaSelection.value.height
  const width = Math.abs(textAreaSelection.value.width)
  const height = Math.abs(textAreaSelection.value.height)
  
  activeTextInput.value = {
    show: true,
    x,
    y,
    width,
    height,
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    value: ''
  }
  
  nextTick(() => {
    if (textInput.value) {
      textInput.value.focus()
    }
  })
}

const confirmTextInput = () => {
  if (!ctx || !activeTextInput.value.value.trim()) {
    cancelTextInput()
    return
  }
  
  // 创建文本元素而不是直接绘制到画布
  const textElement = {
    id: Date.now().toString(),
    x: activeTextInput.value.x,
    y: activeTextInput.value.y,
    text: activeTextInput.value.value,
    fontSize: activeTextInput.value.fontSize,
    fontWeight: activeTextInput.value.fontWeight,
    fontStyle: activeTextInput.value.fontStyle,
    color: brushColor.value
  }
  
  textElements.value.push(textElement)
  
  // 重新绘制所有文本元素
  redrawAllText()
  
  saveToHistory()
  activeTextInput.value.show = false
  activeTextInput.value.value = ''
}

const cancelTextInput = () => {
  activeTextInput.value.show = false
  activeTextInput.value.value = ''
  
  if (ctx && drawingHistory.value[historyIndex.value]) {
    ctx.putImageData(drawingHistory.value[historyIndex.value], 0, 0)
    redrawAllText()
  }
}

// 切换工具
const setTool = (tool: string) => {
  currentTool.value = tool
  showMoreTools.value = false
  if (ctx) {
    updateBrushSettings()
  }
}

// 重新绘制所有文本
const redrawAllText = () => {
  if (!ctx) return
  
  textElements.value.forEach(element => {
    ctx!.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px Arial`
    ctx!.fillStyle = element.color
    ctx!.globalAlpha = brushOpacity.value
    
    const lines = element.text.split('\n')
    const lineHeight = element.fontSize * 1.2
    
    lines.forEach((line, index) => {
      ctx!.fillText(
        line,
        element.x + 5,
        element.y + element.fontSize + (index * lineHeight)
      )
    })
  })
}

// 区域擦除
const areaErase = () => {
  currentTool.value = 'eraser'
  eraserSize.value = 30
  ElMessage({
    message: '区域擦除模式已激活',
    type: 'info',
    duration: 1500
  })
}

// 截图保存
const saveScreenshot = async () => {
  try {
    const html2canvas = await import('html2canvas')
    
    // 隐藏绘制工具栏
    const toolbar = document.querySelector('.drawing-toolbar') as HTMLElement
    const originalToolbarDisplay = toolbar?.style.display
    if (toolbar) {
      toolbar.style.display = 'none'
    }
    
    // 隐藏客服中心FAB
    const serviceFab = document.querySelector('.service-fab-container') as HTMLElement
    const originalServiceFabDisplay = serviceFab?.style.display
    if (serviceFab) {
      serviceFab.style.display = 'none'
    }
    
    // 隐藏绘制模式FAB（如果存在）
    const drawingFab = document.querySelector('.drawing-fab') as HTMLElement
    const originalDrawingFabDisplay = drawingFab?.style.display
    if (drawingFab) {
      drawingFab.style.display = 'none'
    }
    
    const canvas = await html2canvas.default(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0
    })
    
    // 恢复所有隐藏的元素
    if (toolbar && originalToolbarDisplay !== undefined) {
      toolbar.style.display = originalToolbarDisplay
    }
    if (serviceFab && originalServiceFabDisplay !== undefined) {
      serviceFab.style.display = originalServiceFabDisplay
    }
    if (drawingFab && originalDrawingFabDisplay !== undefined) {
      drawingFab.style.display = originalDrawingFabDisplay
    }
    
    if (drawingCanvas.value) {
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = canvas.width
      finalCanvas.height = canvas.height
      const finalCtx = finalCanvas.getContext('2d')
      
      if (finalCtx) {
        finalCtx.drawImage(canvas, 0, 0)
        finalCtx.drawImage(drawingCanvas.value, 0, 0)
        
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
    
    ElMessage({
      message: '截图已保存',
      type: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('截图失败:', error)
    ElMessage({
      message: '截图失败，请重试',
      type: 'error',
      duration: 2000
    })
  }
}

// 判断是否有绘制内容
const hasDrawingContent = () => {
  return (drawingHistory.value.length > 1 || textElements.value.length > 0)
}

// 关闭绘制模式
const closeDrawingMode = () => {
  // 恢复页面交互
  enablePageInteraction()

  if (hasDrawingContent()) {
    ElMessageBox.confirm(
      '当前有绘制内容，关闭绘制模式将清空画布，是否继续？',
      '确认关闭',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      if (ctx && drawingCanvas.value) {
        ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
      }
      isDrawing.value = false
      showToolbar.value = false
      isToolbarVisible.value = false
      activeTextInput.value.show = false
      stopAutoHideTimer()
      ElMessage({
        message: '绘制模式已关闭',
        type: 'info',
        duration: 1000
      })
    }).catch(() => {
      // 用户取消，重新禁用页面交互
      disablePageInteraction()
    })
  } else {
    isDrawing.value = false
    showToolbar.value = false
    isToolbarVisible.value = false
    activeTextInput.value.show = false
    stopAutoHideTimer()
    ElMessage({
      message: '绘制模式已关闭',
      type: 'info',
      duration: 1000
    })
  }
}

// 帮助弹窗状态
const showHelpDialog = ref(false)

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (!isDrawing.value) return
  
  switch (e.key.toLowerCase()) {
    case 'b':
      setTool('pen')
      break
    case 'e':
      setTool('eraser')
      break
    case 't':
      setTool('text')
      break
    case 'l':
      setTool('line')
      break
    case 'r':
      setTool('rectangle')
      break
    case 'c':
      setTool('circle')
      break
    case 'h':
      showHelpDialog.value = true
      break
    case 'd':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        clearDrawing()
      }
      break
    case 'z':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      break
    case 'y':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        redo()
      }
      break
    case 'escape':
      if (activeTextInput.value.show) {
        cancelTextInput()
      } else {
        closeDrawingMode()
      }
      break
    case 'enter':
      if (activeTextInput.value.show && !e.shiftKey) {
        e.preventDefault()
        confirmTextInput()
      }
      break
  }
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  startDrawing(mouseEvent)
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  draw(mouseEvent)
}

const handleTouchEnd = (e: TouchEvent) => {
  e.preventDefault()
  stopDrawing()
}

// 事件处理
const handleResize = () => {
  if (drawingCanvas.value && isDrawing.value) {
    updatePageTransform()
    setupCanvas()
  }
}

const handleScroll = () => {
  if (isDrawing.value) {
    updatePageTransform()
  }
}

// 拖动相关方法
const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  dragOffset.value = {
    x: clientX - toolbarPosition.value.x,
    y: clientY - toolbarPosition.value.y
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
  
  event.preventDefault()
}

const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  const newX = clientX - dragOffset.value.x
  const newY = clientY - dragOffset.value.y
  
  const maxX = window.innerWidth - 80
  const maxY = window.innerHeight - 200
  
  toolbarPosition.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY))
  }
  
  event.preventDefault()
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 监听器
onMounted(() => {
  detectDevice()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      detectDevice()
      handleResize()
    })
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('keydown', handleKeydown)
    // 添加自定义事件监听
    window.addEventListener('toggle-drawing-mode', () => {
      toggleDrawing()
    })
  }
  // 自动隐藏定时器初始化
  watch(
    [isDrawing, isToolbarVisible],
    ([drawing, visible]) => {
      if (drawing && visible) {
        resetAutoHideTimer()
      } else {
        stopAutoHideTimer()
      }
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('scroll', handleScroll)
    document.removeEventListener('keydown', handleKeydown)
    // 移除自定义事件监听
    window.removeEventListener('toggle-drawing-mode', () => {
      toggleDrawing()
    })
    // 确保恢复页面交互
    enablePageInteraction()
  }
  stopAutoHideTimer()
})

// 监听画笔设置变化
watch([brushSize, brushColor, brushOpacity, eraserSize], () => {
  if (ctx) {
    updateBrushSettings()
  }
})
</script>

<template>
  <div class="drawing-fab-container">
    <!-- 绘图工具栏自动隐藏区域 -->
    <div
      v-if="isDrawing"
      @mouseenter="handleToolbarAreaMouseEnter"
      style="position:fixed;z-index:1002;right:0;top:0;width:80px;height:300px;pointer-events:auto;"
    ></div>
    <!-- 绘图工具栏 -->
    <div 
      v-if="isDrawing" 
      :class="['drawing-toolbar', { 
        'hidden': !isToolbarVisible, 
        'dragging': isDragging,
        'mobile': isMobile 
      }]"
      :style="{
        left: isMobile ? '10px' : toolbarPosition.x + 'px',
        top: isMobile ? '60px' : toolbarPosition.y + 'px'
      }"
      @mouseenter="handleToolbarMouseEnter"
      @mouseleave="handleToolbarMouseLeave"
      @mousemove="handleToolbarActivity"
      @mousedown="handleToolbarActivity"
      @touchstart="handleToolbarActivity"
    >
      <!-- 移动端工具栏标题 -->
      <div v-if="isMobile" class="mobile-toolbar-header">
        <span class="toolbar-title">绘图工具</span>
        <button class="toolbar-collapse" @click="toggleToolbar">
          <i :class="isToolbarVisible ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
        </button>
      </div>
      
      <!-- 拖动手柄 -->
      <div 
        v-if="!isMobile"
        class="toolbar-drag-handle"
        @mousedown="startDrag"
        @touchstart="startDrag"
        title="拖动工具栏"
      >
        <i class="ri-drag-move-line"></i>
      </div>
      
      <!-- 隐藏/显示按钮 -->
      <button 
        class="toolbar-toggle"
        @click="toggleToolbar"
        :title="isToolbarVisible ? '隐藏工具栏' : '显示工具栏'"
      >
        <i :class="isToolbarVisible ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'"></i>
      </button>

      <!-- 工具栏内容 -->
      <div v-show="isToolbarVisible" class="toolbar-content">
        <!-- 基础工具 -->
        <div class="tool-section">
          <button 
            :class="['tool-btn', { 'active': currentTool === 'pen' }]"
            @click="setTool('pen')"
            title="画笔 (B)"
          >
            <i class="ri-pencil-line"></i>
          </button>
          
          <button 
            :class="['tool-btn', { 'active': currentTool === 'text' }]"
            @click="setTool('text')"
            title="文本工具 (T)"
          >
            <i class="ri-text"></i>
          </button>
          
          <button 
            :class="['tool-btn', { 'active': currentTool === 'rectangle' }]"
            @click="setTool('rectangle')"
            title="矩形 (R)"
          >
            <i class="ri-rectangle-line"></i>
          </button>
          
          <!-- 更多工具按钮 -->
          <div class="more-tools-container">
            <button 
              class="tool-btn more-btn"
              @click="showMoreTools = !showMoreTools"
              title="更多工具"
            >
              <i class="ri-more-line"></i>
            </button>
            
            <!-- 更多工具菜单 -->
            <div v-if="showMoreTools" class="more-tools-menu">
              <button 
                :class="['tool-btn', { 'active': currentTool === 'line' }]"
                @click="setTool('line')"
                title="直线 (L)"
              >
                <i class="ri-subtract-line"></i>
              </button>
              
              <button 
                :class="['tool-btn', { 'active': currentTool === 'arrow' }]"
                @click="setTool('arrow')"
                title="箭头"
              >
                <i class="ri-arrow-right-up-line"></i>
              </button>
              
              <button 
                :class="['tool-btn', { 'active': currentTool === 'circle' }]"
                @click="setTool('circle')"
                title="圆形 (C)"
              >
                <i class="ri-checkbox-blank-circle-line"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 颜色选择 -->
        <div class="tool-section color-section">
          <div class="color-grid">
            <div 
              v-for="color in colorOptions.slice(0, 4)" 
              :key="color"
              :class="['color-option', { 'active': brushColor === color }]"
              :style="{ backgroundColor: color }"
              @click="brushColor = color"
            ></div>
          </div>
          <el-color-picker 
            v-model="brushColor" 
            size="small" 
            class="custom-color-picker"
          />
        </div>

        <!-- 粗细调节 -->
        <div class="tool-section slider-section">
          <div class="slider-container">
            <label>粗细</label>
            <el-slider 
              v-if="currentTool !== 'eraser'"
              v-model="brushSize" 
              :min="1" 
              :max="10" 
              :show-tooltip="false"
              class="compact-slider"
            />
            <el-slider 
              v-else
              v-model="eraserSize" 
              :min="5" 
              :max="50" 
              :show-tooltip="false"
              class="compact-slider"
            />
            <span class="value-display">{{ currentTool === 'eraser' ? eraserSize : brushSize }}</span>
          </div>
        </div>

        <!-- 透明度调节 -->
        <!-- <div class="tool-section slider-section">
          <div class="slider-container">
            <label>透明度</label>
            <el-slider 
              v-model="brushOpacity" 
              :min="0.1" 
              :max="1" 
              :step="0.1"
              :show-tooltip="false"
              class="compact-slider"
            />
            <span class="value-display">{{ Math.round(brushOpacity * 100) }}%</span>
          </div>
        </div> -->

        <!-- 擦除工具 -->
        <div class="tool-section">
          <button 
            :class="['tool-btn', { 'active': currentTool === 'eraser' }]"
            @click="setTool('eraser')"
            title="橡皮擦 (E)"
          >
            <i class="ri-eraser-line"></i>
          </button>
          
          <!-- <button 
            class="tool-btn"
            @click="areaErase"
            title="区域擦除"
          >
            <i class="ri-eraser-fill"></i>
          </button> -->
        </div>

        <!-- 操作按钮 -->
        <div class="tool-section">
          <button 
            class="tool-btn"
            @click="undo"
            :disabled="historyIndex <= 0"
            title="撤销 (Ctrl+Z)"
          >
            <i class="ri-arrow-go-back-line"></i>
          </button>
          
          <button 
            class="tool-btn"
            @click="redo"
            :disabled="historyIndex >= drawingHistory.length - 1"
            title="重做 (Ctrl+Shift+Z)"
          >
            <i class="ri-arrow-go-forward-line"></i>
          </button>
          
          <button 
            class="tool-btn"
            @click="saveScreenshot"
            title="截图保存 (Ctrl+S)"
          >
            <i class="ri-camera-line"></i>
          </button>
          
          <button 
            class="tool-btn clear-btn"
            @click="clearDrawing"
            title="清空画布"
          >
            <i class="ri-delete-bin-line"></i>
          </button>
          
        </div>
      </div>
    </div>

    <!-- 工具预览 -->
    <div v-if="isDrawing && currentTool !== 'text'" class="brush-preview">
      <div 
        class="preview-circle"
        :style="{
          width: (currentTool === 'eraser' ? eraserSize : brushSize) + 'px',
          height: (currentTool === 'eraser' ? eraserSize : brushSize) + 'px',
          backgroundColor: currentTool === 'eraser' ? 'transparent' : brushColor,
          border: currentTool === 'eraser' ? '2px dashed #666' : 'none',
          opacity: brushOpacity
        }"
      ></div>
      <div class="preview-info">
        {{ currentTool === 'eraser' ? eraserSize : brushSize }}px
      </div>
    </div>

    <!-- 文本输入框 - 去掉虚框 -->
    <div 
      v-if="activeTextInput.show"
      class="text-input-overlay"
      :style="{
        left: activeTextInput.x + 'px',
        top: activeTextInput.y + 'px',
        width: activeTextInput.width + 'px',
        height: activeTextInput.height + 'px'
      }"
    >
      <div class="text-input-controls">
        <select v-model.number="activeTextInput.fontSize" class="font-size-select">
          <option :value="12">12px</option>
          <option :value="14">14px</option>
          <option :value="16">16px</option>
          <option :value="18">18px</option>
          <option :value="20">20px</option>
          <option :value="24">24px</option>
          <option :value="28">28px</option>
          <option :value="32">32px</option>
        </select>
        
        <button 
          :class="['text-style-btn', { 'active': activeTextInput.fontWeight === 'bold' }]"
          @click="activeTextInput.fontWeight = activeTextInput.fontWeight === 'bold' ? 'normal' : 'bold'"
          title="加粗"
        >
          <i class="ri-bold"></i>
        </button>
        
        <button 
          :class="['text-style-btn', { 'active': activeTextInput.fontStyle === 'italic' }]"
          @click="activeTextInput.fontStyle = activeTextInput.fontStyle === 'italic' ? 'normal' : 'italic'"
          title="斜体"
        >
          <i class="ri-italic"></i>
        </button>
        
        <button class="text-confirm-btn" @click="confirmTextInput" title="确认">
          <i class="ri-check-line"></i>
        </button>
        
        <button class="text-cancel-btn" @click="cancelTextInput" title="取消">
          <i class="ri-close-line"></i>
        </button>
      </div>
      
      <textarea 
        ref="textInput"
        v-model="activeTextInput.value"
        class="text-input-area"
        :style="{
          fontSize: activeTextInput.fontSize + 'px',
          fontWeight: activeTextInput.fontWeight,
          fontStyle: activeTextInput.fontStyle,
          color: brushColor
        }"
        placeholder="输入文本内容..."
        @keydown.enter.exact="confirmTextInput"
        @keydown.escape="cancelTextInput"
      ></textarea>
    </div>

    <!-- 画布 -->
    <canvas 
      v-if="isDrawing"
      ref="drawingCanvas"
      class="drawing-canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    ></canvas>
  </div>
</template>

<style lang="scss" scoped>
.drawing-fab-container {
  position: relative;
  z-index: 1001;
}

// 主悬浮按钮
.drawing-fab {
  position: fixed;
  right: 30px;
  top: 100px; // 移动到上面
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1001;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #45a049;
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  }
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
  
  .drawing-fab.expanded & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.fab-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  color: #4CAF50;
  border: 2px solid #4CAF50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover, &.active {
    background-color: #4CAF50;
    color: white;
    transform: scale(1.05);
  }
}

// 添加关闭按钮样式
.close-btn:hover {
  background: #ff6b35 !important;
  color: white !important;
  border-color: #ff6b35 !important;
}

// 新增帮助按钮和帮助弹窗样式
.toolbar-close-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  z-index: 10;
  transition: all 0.2s;
  
  &:hover {
    background: #ff3838;
    transform: scale(1.1);
  }
}

.help-btn:hover {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.help-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.help-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
}

.help-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
}

.help-content {
  padding: 20px 24px;
}

.help-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    margin: 0 0 12px 0;
    color: #4CAF50;
    font-size: 14px;
    font-weight: 600;
  }
}

.help-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
  
  kbd {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 11px;
    font-family: monospace;
    margin-right: 8px;
    color: #333;
    min-width: 20px;
    text-align: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .help-dialog {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .toolbar-close-btn {
    top: -6px;
    right: -6px;
    width: 24px;
    height: 24px;
    font-size: 14px;
  }
}


// 绘图工具栏
.drawing-toolbar {
  position: fixed;
  left: 20px; // 改为左侧固定位置
  top: 10%; // 垂直居中
  transform: translateY(-50%); // 垂直居中对齐
  background: #f8f9fa;;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1002;
  width: 60px;
  transition: transform 0.3s ease;
  
  &.hidden {
    transform: translateY(-50%) translateX(calc(-100% + 20px)); // 隐藏时向左滑出
  }
  
  &.mobile {
    width: 280px;
    right: 10px;
    top: 60px;
    left: auto;
    transform: none;
    background: #f8f9fa;; 
    
    &.hidden {
      transform: translateX(calc(100% - 20px));
    }
  }
}

.mobile-toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  
  .toolbar-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  
  .toolbar-collapse {
    background: none;
    border: none;
    font-size: 16px;
    color: #666;
    cursor: pointer;
    padding: 4px;
    
    &:hover {
      color: #333;
    }
  }
}

.toolbar-drag-handle {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  font-size: 0.8rem;
  color: #666;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
}

.toolbar-toggle {
  position: absolute;
  left: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 40px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 15px 0 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s ease;
  z-index: 1;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
}

.toolbar-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .mobile & {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
  }
  
  .mobile & {
    flex-direction: row;
    border-bottom: none;
    padding: 4px;
    background: #f8f9fa;
    border-radius: 8px;
    flex: 1;
    min-width: 120px;
    
    &.color-section {
      flex-direction: column;
      align-items: center;
    }
    
    &.slider-section {
      flex-direction: column;
    }
  }
}

.tool-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
  color: #666;
  
  &:hover {
    background: #f5f5f5;
    border-color: #4CAF50;
    color: #4CAF50;
  }
  
  &.active {
    background: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: white;
      border-color: #ddd;
      color: #666;
    }
  }
  
  &.clear-btn:hover {
    background: #ff4757;
    color: white;
    border-color: #ff4757;
  }
}

// 更多工具
.more-tools-container {
  position: relative;
}

.more-tools-menu {
  position: absolute;
  left: -60px;
  top: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
  
  .mobile & {
    left: 0;
    top: 50px;
    flex-direction: row;
  }
}

// 颜色选择
.color-section {
  align-items: center;
}

.color-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  margin-bottom: 4px;
  
  .mobile & {
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 8px;
  }
}

.color-option {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.active {
    border-color: #333;
    transform: scale(1.2);
  }
  
  .mobile & {
    width: 24px;
    height: 24px;
  }
}

.custom-color-picker {
  width: 40px;
  height: 24px;
}

// 滑块部分
.slider-section {
  .slider-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    
    label {
      font-size: 10px;
      color: #666;
      text-align: center;
    }
    
    .mobile & {
      label {
        font-size: 12px;
      }
    }
  }
}

.compact-slider {
  width: 40px;
  
  .mobile & {
    width: 100px;
  }
  
  :deep(.el-slider__runway) {
    height: 4px;
  }
  
  :deep(.el-slider__button) {
    width: 12px;
    height: 12px;
  }
}

.value-display {
  font-size: 9px;
  color: #666;
  text-align: center;
  min-height: 12px;
  
  .mobile & {
    font-size: 11px;
  }
}

// 画笔预览
.brush-preview {
  position: fixed;
  right: 100px;
  top: 120px;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .preview-circle {
    border-radius: 50%;
    min-width: 8px;
    min-height: 8px;
  }
  
  .preview-info {
    font-size: 10px;
    color: #666;
  }
}

// 文本输入覆盖层
.text-input-overlay {
  position: fixed;
  background: rgba(255, 255, 255, 1); // 改为完全不透明
  border: none; // 去掉边框
  border-radius: 4px;
  z-index: 1003;
  display: flex;
  flex-direction: column;
}

.text-input-controls {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 4px 4px 0 0;
}

.font-size-select {
  padding: 2px 4px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 11px;
}

.text-style-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
}

.text-confirm-btn, .text-cancel-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.text-confirm-btn {
  background: #28a745;
  color: white;
  
  &:hover {
    background: #218838;
  }
}

.text-cancel-btn {
  background: #dc3545;
  color: white;
  
  &:hover {
    background: #c82333;
  }
}

.text-input-area {
  flex: 1;
  border: none;
  padding: 8px;
  resize: none;
  outline: none;
  font-family: Arial, sans-serif;
  background: transparent;
  box-shadow: none;
}

// 画布
.drawing-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  pointer-events: auto;
  cursor: crosshair;
}

// 响应式设计
@media (max-width: 768px) {
  .drawing-fab {
    right: 20px;
    bottom: 20px;
  }
  
  .drawing-toolbar {
    &.hidden {
      transform: translateX(calc(100% - 15px));
    }
  }
  
  .toolbar-toggle {
    left: -12px;
    width: 24px;
    height: 32px;
  }
  
  .brush-preview {
    right: 70px;
    top: 100px;
  }
}

// 触摸设备优化
@media (hover: none) and (pointer: coarse) {
  .tool-btn, .fab-item {
    min-height: 44px;
    min-width: 44px;
  }
  
  .color-option {
    min-width: 20px;
    min-height: 20px;
  }
  
  .text-style-btn, .text-confirm-btn, .text-cancel-btn {
    min-width: 32px;
    min-height: 32px;
  }
}
</style>