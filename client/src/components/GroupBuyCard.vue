<template>
  <el-card class="groupbuy-card" shadow="hover">
    <div class="card-header">
      <div class="status-wrap">
        <el-tag :type="statusType" effect="light" size="small" round>
          {{ statusText }}
        </el-tag>
        <el-tag v-if="groupBuy.allowWaitlist && groupBuy.waitlistQuantity > 0" type="warning" effect="plain" size="small" round style="margin-left: 6px">
          候补 {{ groupBuy.waitlistQuantity }} 份
        </el-tag>
      </div>
      <span class="price">¥{{ groupBuy.unitPrice }} / 份</span>
    </div>
    <h3 class="gb-title">{{ groupBuy.title }}</h3>
    <div class="gb-recipe" v-if="groupBuy.recipe">
      <el-image :src="groupBuy.recipe.imageUrl" class="recipe-thumb" fit="cover" />
      <div class="recipe-meta">
        <span class="recipe-name">{{ groupBuy.recipe.name }}</span>
        <span class="recipe-duration">制作 {{ groupBuy.recipe.duration }} 分钟 · 保存 {{ groupBuy.recipe.shelfLife }}</span>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-inner" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="progress-text">
      <span>已订 {{ groupBuy.currentQuantity }} 份</span>
      <span>上限 {{ groupBuy.maxQuantity }} 份</span>
    </div>
    <div class="gb-info">
      <div class="info-item">
        <el-icon color="#D4865A"><Clock /></el-icon>
        <span>取货: {{ formatTime(groupBuy.pickupTime) }}</span>
      </div>
      <div class="info-item">
        <el-icon color="#D4865A"><Timer /></el-icon>
        <span>截止: {{ formatTime(groupBuy.productionDeadline) }}</span>
      </div>
      <div class="info-item">
        <el-icon color="#D4865A"><Goods /></el-icon>
        <span>每日 {{ groupBuy.dailyBatches }} 批次</span>
      </div>
      <div class="info-item">
        <el-icon color="#D4865A"><Wallet /></el-icon>
        <span>{{ paymentText }}</span>
      </div>
    </div>
    <div v-if="groupBuy.timeSlots && groupBuy.timeSlots.length > 0" class="time-slots">
      <div class="slots-title">
        <el-icon color="#D4865A"><Calendar /></el-icon>
        <span>取货时段</span>
      </div>
      <div class="slots-list">
        <el-tag
          v-for="ts in groupBuy.timeSlots"
          :key="ts.id"
          :type="ts.filled >= ts.capacity ? 'info' : 'success'"
          effect="light"
          size="small"
        >
          {{ ts.time }} ({{ ts.filled }}/{{ ts.capacity }})
        </el-tag>
      </div>
    </div>
    <div class="card-actions">
      <el-button
        type="primary"
        :disabled="groupBuy.status !== 'active'"
        @click="$emit('order', groupBuy)"
      >
        <el-icon><ShoppingCart /></el-icon>
        我要下单
      </el-button>
      <el-button
        v-if="groupBuy.status === 'active'"
        type="warning"
        plain
        @click="$emit('close', groupBuy)"
      >
        截单
      </el-button>
      <el-button
        v-if="groupBuy.waitlistQuantity > 0 || groupBuy.status === 'closed'"
        type="success"
        plain
        @click="$emit('expand', groupBuy)"
      >
        扩容
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GroupBuy } from '@/types'

const props = defineProps<{
  groupBuy: GroupBuy
}>()

defineEmits<{
  (e: 'order', groupBuy: GroupBuy): void
  (e: 'close', groupBuy: GroupBuy): void
  (e: 'expand', groupBuy: GroupBuy): void
}>()

const progressPercent = computed(() => {
  return Math.min(100, (props.groupBuy.currentQuantity / props.groupBuy.maxQuantity) * 100)
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    active: '接龙中',
    closed: '已截单',
    completed: '已完成'
  }
  return map[props.groupBuy.status]
})

const statusType = computed(() => {
  const map: Record<string, any> = {
    active: 'success',
    closed: 'info',
    completed: 'warning'
  }
  return map[props.groupBuy.status]
})

const paymentText = computed(() => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    cash: '现金',
    bank_transfer: '银行转账'
  }
  return map[props.groupBuy.paymentMethod]
})

const formatTime = (t: string) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.groupbuy-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
  transition: all 0.3s ease;
}

.groupbuy-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(93, 58, 42, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-wrap {
  display: flex;
  align-items: center;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #D4622C;
}

.gb-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #5D3A2A;
  font-weight: 600;
}

.gb-recipe {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 8px 10px;
  background: #FFF5EB;
  border-radius: 8px;
}

.recipe-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
}

.recipe-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recipe-name {
  font-size: 13px;
  color: #5D3A2A;
  font-weight: 500;
}

.recipe-duration {
  font-size: 11px;
  color: #B8917A;
}

.progress-bar {
  height: 8px;
  background: #F5E6D3;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #FFB88A, #D4622C);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8B5A3C;
  margin-bottom: 14px;
}

.gb-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8B5A3C;
}

.time-slots {
  background: #FFF8F0;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 14px;
}

.slots-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #5D3A2A;
  margin-bottom: 8px;
}

.slots-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-actions .el-button {
  flex: 1;
  min-width: 80px;
}
</style>
