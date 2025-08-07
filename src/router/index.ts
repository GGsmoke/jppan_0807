import { createRouter, createWebHistory } from 'vue-router'
import { stopAllAudio } from '../utils/audio'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomePage.vue')
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('../views/CoursesPage.vue')
    },
    {
      path: '/courses/:level',
      name: 'course-level',
      component: () => import('../views/CoursesPage.vue')
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: () => import('../views/VocabularyPage.vue')
    },
    {
      path: '/grammar',
      name: 'grammar',
      component: () => import('../views/GrammarPage.vue')
    },
    {
      path: '/grammar/:id',
      name: 'grammar-detail',
      component: () => import('../views/GrammarDetailPage.vue')
    },
    {
      path: '/gojuon',
      name: 'gojuon',
      component: () => import('../views/GojuonPage.vue')
    },
    {
      path: '/conversation',
      name: 'conversation',
      component: () => import('../views/ConversationPage.vue')
    },
    {
      path: '/listening',
      name: 'listening',
      component: () => import('../views/ListeningPage.vue')
    },
    {
      path: '/reading',
      name: 'reading',
      component: () => import('../views/ReadingPage.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactPage.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FAQPage.vue')
    },
    {
      path: '/study-method',
      name: 'study-method',
      component: () => import('../views/StudyMethodPage.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyPage.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/TermsPage.vue')
    },
    {
      path: '/Xieyi',
      name: 'Xieyi',
      component: () => import('../views/UserXieyiPage.vue')
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/PracticePage.vue')
    },
    {
      path: '/practice/:id',
      name: 'practice-detail',
      component: () => import('../views/PracticeDetailPage.vue')
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/LoginPage.vue')
    },
    {
      path: '/auth/register',
      name: 'register', 
      component: () => import('../views/auth/RegisterPage.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfilePage.vue')
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('../views/EditUserPassword.vue')
    },
    {
      path: '/teachers/:id',
      name: 'teacher-detail',
      component: () => import('../views/TeacherDetailPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundPage.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 添加路由守卫，在页面切换时停止所有音频
router.beforeEach((to, from, next) => {
  // 停止所有音频播放
  stopAllAudio()
  next()
})

export default router