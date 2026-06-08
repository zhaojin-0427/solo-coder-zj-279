<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="layout-aside">
      <div class="logo">
        <el-icon :size="28" color="#D4865A"><Crop /></el-icon>
        <span class="logo-text">烘焙工坊</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#5D3A2A"
        text-color="#F5E6D3"
        active-text-color="#FFB88A"
        class="layout-menu"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="'/'+route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-user">
          <el-avatar :size="36" :src="userStore.user?.avatar" />
          <span class="user-name">{{ userStore.user?.nickname }}</span>
          <el-button
            type="text"
            size="small"
            @click="handleLogout"
            style="margin-left: 12px; color: #8B5A3C"
          >
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menuRoutes = computed(() => {
  const matched = router.options.routes.find(r => r.path === '/')
  return matched?.children || []
})

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title as string || '')

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
  }).catch(() => {})
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: linear-gradient(180deg, #5D3A2A 0%, #3E2519 100%);
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 184, 138, 0.2);
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #FFD4B8;
  letter-spacing: 1px;
}

.layout-menu {
  flex: 1;
  border-right: none;
}

.layout-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 8px;
}

.layout-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 184, 138, 0.15);
}

.layout-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 184, 138, 0.25);
}

.layout-header {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(93, 58, 42, 0.08);
  padding: 0 28px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #5D3A2A;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  color: #5D3A2A;
  font-size: 14px;
}

.layout-main {
  background-color: #FFF8F0;
  padding: 24px;
  overflow-y: auto;
}
</style>
