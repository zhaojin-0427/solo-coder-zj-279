import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/recipes',
    children: [
      {
        path: 'recipes',
        name: 'Recipes',
        component: () => import('@/views/RecipeLibrary.vue'),
        meta: { title: '食谱库', icon: 'Notebook' }
      },
      {
        path: 'create-group-buy',
        name: 'CreateGroupBuy',
        component: () => import('@/views/CreateGroupBuy.vue'),
        meta: { title: '发起接龙', icon: 'Plus' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/OrderManagement.vue'),
        meta: { title: '订单管理', icon: 'ShoppingCart' }
      },
      {
        path: 'reviews',
        name: 'Reviews',
        component: () => import('@/views/Reviews.vue'),
        meta: { title: '评价互动', icon: 'ChatDotRound' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: { title: '数据统计', icon: 'DataAnalysis' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { useUserStore } = await import('@/stores/user')
  const userStore = useUserStore()
  userStore.initUser()
  next()
})

export default router
