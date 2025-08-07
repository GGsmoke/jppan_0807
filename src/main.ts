/**
 * 应用程序入口文件
 * 负责初始化 Vue 应用、配置插件和挂载应用
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'remixicon/fonts/remixicon.css'
import './styles/main.scss'
import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册 Pinia 状态管理
app.use(createPinia())

// 注册 Vue Router 路由管理
app.use(router)

// 注册 Element Plus UI 组件库
app.use(ElementPlus)

// 挂载应用到 DOM
app.mount('#app')

// 在 main.ts 中添加全局错误处理
window.addEventListener('error', (event) => {
  // 忽略来自扩展程序的错误
  if (event.filename && event.filename.includes('content_scripts')) {
    event.preventDefault()
    return false
  }
})

window.addEventListener('unhandledrejection', (event) => {
  // 忽略来自扩展程序的 Promise 错误
  if (event.reason && event.reason.stack && event.reason.stack.includes('content_scripts')) {
    event.preventDefault()
    return false
  }
})