import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

const mockUser: User = {
  id: 1,
  username: 'baker',
  nickname: '烘焙达人',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  role: 'admin'
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  const login = (username: string, password: string) => {
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        user.value = mockUser
        localStorage.setItem('user', JSON.stringify(mockUser))
        resolve(mockUser)
      }, 500)
    })
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  const initUser = () => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        user.value = JSON.parse(saved)
        return
      } catch {
        localStorage.removeItem('user')
      }
    }
    user.value = mockUser
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    initUser
  }
})
