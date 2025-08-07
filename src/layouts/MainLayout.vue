<script setup lang="ts">
/**
 * 主布局组件
 * 提供应用的整体布局结构：头部、主内容区、客服组件、底部
 */
import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import ServiceFAB from '../components/common/ServiceFAB.vue'
import DrawingFAB from '../components/common/DrawingFAB.vue'
import { useRoute } from 'vue-router'

// 获取当前路由信息
const route = useRoute()
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <MainHeader />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 插槽：用于显示页面内容 -->
      <slot></slot>
    </main>
    
    <!-- 悬浮客服按钮 -->
    <ServiceFAB />
    
    <!-- 绘制功能按钮 -->
    <DrawingFAB />
    
    <!-- 底部信息 - 只在首页显示 -->
    <MainFooter v-if="route.name === 'home'" />
  </div>
</template>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: var(--background-color);
  padding-top: 60px; // 为固定头部预留空间
}
</style>