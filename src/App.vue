<script setup lang="ts">
/**
 * 应用程序根组件
 * 提供全局布局结构，包含路由视图
 */
import { RouterView } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
</script>

<template>
  <!-- 主布局组件包装路由视图 -->
  <MainLayout>
    <!-- 路由视图，显示当前路由对应的组件 -->
    <RouterView />
  </MainLayout>
</template>