<template>
  <div class="review-item">
    <div class="review-header">
      <el-avatar :size="40" :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
      <div class="review-user">
        <div class="user-name">{{ review.userName }}</div>
        <div class="review-time">{{ formatTime(review.createdAt) }}</div>
      </div>
      <div class="review-rating">
        <el-rate v-model="rating" disabled size="small" />
      </div>
    </div>
    <div class="review-content">{{ review.content }}</div>
    <div class="review-order" v-if="review.order">
      <el-tag type="warning" effect="plain" size="small">
        {{ review.order.groupBuy?.title || '订单 #' + review.orderId }}
      </el-tag>
      <span class="order-qty">x{{ review.order.quantity }} 份</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Review } from '@/types'

const props = defineProps<{
  review: Review
}>()

const rating = ref(props.review.rating)

watch(() => props.review.rating, (val) => {
  rating.value = val
})

const formatTime = (t: string) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.review-item {
  padding: 18px 0;
  border-bottom: 1px solid #F0E0D0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-user {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #5D3A2A;
  margin-bottom: 2px;
}

.review-time {
  font-size: 12px;
  color: #B8917A;
}

.review-content {
  font-size: 14px;
  color: #5D3A2A;
  line-height: 1.7;
  margin-bottom: 12px;
  padding-left: 52px;
}

.review-order {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 52px;
}

.order-qty {
  font-size: 12px;
  color: #8B5A3C;
}
</style>
