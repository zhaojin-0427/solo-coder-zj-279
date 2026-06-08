<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon :size="24" color="#D4865A"><DataAnalysis /></el-icon>
        运营数据统计
      </h2>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="12" :sm="6">
        <div class="kpi-card">
          <div class="kpi-icon icon-orange">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">总接龙数</div>
            <div class="kpi-value">{{ stats.totalGroupBuys }}</div>
            <div class="kpi-trend">
              <el-icon><ArrowUp /></el-icon>
              共 {{ stats.totalRecipes }} 个食谱
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="kpi-card">
          <div class="kpi-icon icon-green">
            <el-icon :size="28"><ShoppingCart /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">总订单数</div>
            <div class="kpi-value">{{ stats.totalOrders }}</div>
            <div class="kpi-trend positive">
              <el-icon><CircleCheck /></el-icon>
              已完成 {{ stats.completedOrders }}
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="kpi-card">
          <div class="kpi-icon icon-brown">
            <el-icon :size="28"><Wallet /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">总营业额</div>
            <div class="kpi-value">¥{{ stats.totalRevenue.toFixed(0) }}</div>
            <div class="kpi-trend">
              客单价 ¥{{ avgOrderValue }}
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="kpi-card">
          <div class="kpi-icon icon-purple">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">参与用户</div>
            <div class="kpi-value">{{ stats.totalUsers }}</div>
            <div class="kpi-trend">
              <el-icon><ChatDotRound /></el-icon>
              {{ stats.totalReviews }} 条评价
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-divider content-position="left" class="section-divider">
      <span class="section-title">排产与候补协同指标</span>
    </el-divider>

    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="24" :sm="6">
        <div class="kpi-card highlight">
          <div class="kpi-label-row">
            <span class="kpi-label">候补转正率</span>
            <el-tooltip effect="light" placement="top">
              <template #content>已转正的候补订单数 / 所有候补订单总数</template>
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="kpi-value highlight-value">{{ (stats.waitlistConversionRate * 100).toFixed(1) }}%</div>
          <el-progress :percentage="Math.round(stats.waitlistConversionRate * 100)" :stroke-width="8" color="#D4622C" :show-text="false" />
          <div class="kpi-sub">
            <span style="color: #5D8A4F">{{ promotedFromWaitlist }} 人已转正</span>
            <span style="color: #8B5A3C"> · 共 {{ totalWaitlisted }} 候补</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="6">
        <div class="kpi-card highlight">
          <div class="kpi-label-row">
            <span class="kpi-label">按时交付率</span>
            <el-tooltip effect="light" placement="top">
              <template #content>取货时间前后30分钟内完成取货的订单 / 总完成订单</template>
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="kpi-value highlight-value green">{{ (stats.onTimeDeliveryRate * 100).toFixed(1) }}%</div>
          <el-progress :percentage="Math.round(stats.onTimeDeliveryRate * 100)" :stroke-width="8" color="#5D8A4F" :show-text="false" />
          <div class="kpi-sub">
            <span style="color: #5D8A4F">{{ onTimeCount }} 单按时</span>
            <span style="color: #8B5A3C"> · 共 {{ stats.completedOrders }} 单完成</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="6">
        <div class="kpi-card highlight">
          <div class="kpi-label-row">
            <span class="kpi-label">时段履约率</span>
            <el-tooltip effect="light" placement="top">
              <template #content>各取货时段实际 filled / 时段 capacity 合计</template>
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="kpi-value highlight-value">{{ (stats.timeSlotFulfillmentRate * 100).toFixed(1) }}%</div>
          <el-progress :percentage="Math.round(stats.timeSlotFulfillmentRate * 100)" :stroke-width="8" color="#D4865A" :show-text="false" />
          <div class="kpi-sub">
            <span style="color: #5D8A4F">{{ totalSlotFilled }} 份已分配</span>
            <span style="color: #8B5A3C"> · 容量 {{ totalSlotCapacity }} 份</span>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="6">
        <div class="kpi-card highlight">
          <div class="kpi-label-row">
            <span class="kpi-label">平均评分</span>
            <el-tooltip effect="light" placement="top">
              <template #content>所有用户评价的平均分（满分5）</template>
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div class="kpi-value highlight-value purple">
            {{ stats.avgRating.toFixed(2) }}
            <el-icon :size="18" color="#F5A623"><Star /></el-icon>
          </div>
          <el-rate v-model="avgRatingDisplay" disabled size="large" />
          <div class="kpi-sub">
            <span style="color: #8B5A3C">基于 {{ stats.totalReviews }} 条评价</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">食谱产能利用率</span>
              <el-tag type="info" effect="plain" size="small">实际订单 / (接龙上限 × 每日批次)</el-tag>
            </div>
          </template>
          <div v-chart="capacityChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">取货时段履约分布</span>
            </div>
          </template>
          <div v-chart="slotChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单状态分布</span>
            </div>
          </template>
          <div v-chart="statusChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">食谱销售排行</span>
            </div>
          </template>
          <div v-chart="recipeChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import type { Statistics, Order, GroupBuy, Recipe, TimeSlot } from '@/types'
import { getStatistics } from '@/api/statistics'
import type { EChartsOption } from 'echarts'

const avgRatingDisplay = ref(0)

const mockRecipes: Recipe[] = [
  { id: 1, name: '经典黄油曲奇', description: '', imageUrl: '', ingredients: [], steps: [], cost: 25, duration: 60, shelfLife: '7天', createdAt: '', updatedAt: '' },
  { id: 2, name: '软心巧克力蛋糕', description: '', imageUrl: '', ingredients: [], steps: [], cost: 35, duration: 45, shelfLife: '当天', createdAt: '', updatedAt: '' },
  { id: 3, name: '抹茶红豆司康', description: '', imageUrl: '', ingredients: [], steps: [], cost: 18, duration: 30, shelfLife: '3天', createdAt: '', updatedAt: '' },
  { id: 4, name: '咸蛋黄肉松贝果', description: '', imageUrl: '', ingredients: [], steps: [], cost: 22, duration: 50, shelfLife: '2天', createdAt: '', updatedAt: '' }
]

const mockTimeSlots1: TimeSlot[] = [
  { id: 1, time: '10:00-11:00', capacity: 10, filled: 8 },
  { id: 2, time: '14:00-15:00', capacity: 12, filled: 10 },
  { id: 3, time: '16:00-17:00', capacity: 8, filled: 5 }
]

const mockTimeSlots2: TimeSlot[] = [
  { id: 1, time: '09:00-10:00', capacity: 8, filled: 7 },
  { id: 2, time: '15:00-16:00', capacity: 10, filled: 9 }
]

const mockGroupBuys: GroupBuy[] = [
  { id: 1, recipeId: 1, recipe: mockRecipes[0], title: '本周六黄油曲奇接龙', maxQuantity: 30, currentQuantity: 23, waitlistQuantity: 2, pickupTime: '2026-06-10T15:00:00', productionDeadline: '2026-06-10T10:00:00', dailyBatches: 3, allowWaitlist: true, timeSlots: mockTimeSlots1, paymentMethod: 'wechat', status: 'active', unitPrice: 38, createdAt: '', updatedAt: '' },
  { id: 2, recipeId: 2, recipe: mockRecipes[1], title: '周末巧克力熔岩蛋糕', maxQuantity: 20, currentQuantity: 20, waitlistQuantity: 3, pickupTime: '2026-06-09T10:00:00', productionDeadline: '2026-06-09T08:00:00', dailyBatches: 2, allowWaitlist: true, timeSlots: mockTimeSlots2, paymentMethod: 'alipay', status: 'active', unitPrice: 58, createdAt: '', updatedAt: '' },
  { id: 3, recipeId: 3, recipe: mockRecipes[2], title: '周三抹茶司康小团', maxQuantity: 15, currentQuantity: 12, waitlistQuantity: 0, pickupTime: '2026-06-07T14:00:00', productionDeadline: '2026-06-07T10:00:00', dailyBatches: 2, allowWaitlist: false, timeSlots: [{ id: 1, time: '14:00-15:00', capacity: 15, filled: 12 }], paymentMethod: 'wechat', status: 'completed', unitPrice: 28, createdAt: '', updatedAt: '' },
  { id: 4, recipeId: 4, recipe: mockRecipes[3], title: '咸蛋黄贝果接龙', maxQuantity: 25, currentQuantity: 15, waitlistQuantity: 1, pickupTime: '2026-06-11T11:00:00', productionDeadline: '2026-06-11T08:00:00', dailyBatches: 2, allowWaitlist: true, timeSlots: [{ id: 1, time: '11:00-12:00', capacity: 25, filled: 15 }], paymentMethod: 'wechat', status: 'active', unitPrice: 32, createdAt: '', updatedAt: '' }
]

const mockOrders: Order[] = [
  { id: 1001, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小明', phone: '13800138001', quantity: 2, totalAmount: 76, status: 'completed', pickedUpAt: '2026-06-10T14:55:00', timeSlotId: 2, createdAt: '2026-06-05T12:00:00', updatedAt: '2026-06-10T14:55:00' },
  { id: 1002, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小红', phone: '13800138002', quantity: 3, totalAmount: 114, status: 'completed', pickedUpAt: '2026-06-10T15:05:00', timeSlotId: 2, createdAt: '2026-06-06T09:30:00', updatedAt: '2026-06-10T15:05:00' },
  { id: 1003, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小李', phone: '13800138003', quantity: 4, totalAmount: 152, status: 'waitlisted', waitlistPosition: 1, timeSlotId: 3, createdAt: '2026-06-07T08:15:00', updatedAt: '2026-06-07T08:15:00' },
  { id: 1004, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小美', phone: '13800138004', quantity: 5, totalAmount: 190, status: 'to_produce', timeSlotId: 1, createdAt: '2026-06-06T16:45:00', updatedAt: '2026-06-07T10:00:00' },
  { id: 1005, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小周', phone: '13800138005', quantity: 2, totalAmount: 76, status: 'waitlisted', waitlistPosition: 2, timeSlotId: 3, createdAt: '2026-06-08T11:20:00', updatedAt: '2026-06-08T11:20:00' },
  { id: 1006, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 1, userName: '小孙', phone: '13800138006', quantity: 1, totalAmount: 58, status: 'pending_pickup', timeSlotId: 1, createdAt: '2026-06-07T13:00:00', updatedAt: '2026-06-09T09:30:00' },
  { id: 1007, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 1, userName: '小郑', phone: '13800138007', quantity: 2, totalAmount: 116, status: 'cancelled', createdAt: '2026-06-08T09:00:00', updatedAt: '2026-06-08T11:00:00' },
  { id: 1008, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 1, userName: '小陈', phone: '13800138008', quantity: 1, totalAmount: 58, status: 'waitlisted', waitlistPosition: 1, timeSlotId: 2, createdAt: '2026-06-08T15:00:00', updatedAt: '2026-06-08T15:00:00' },
  { id: 1009, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 1, userName: '老王', phone: '13800138009', quantity: 3, totalAmount: 174, status: 'completed', pickedUpAt: '2026-06-09T10:35:00', timeSlotId: 1, createdAt: '2026-05-18T10:00:00', updatedAt: '2026-06-09T10:35:00' }
]

const mockStats: Statistics = {
  totalGroupBuys: 4,
  totalOrders: 9,
  totalUsers: 6,
  totalRevenue: 880,
  totalRecipes: 4,
  totalReviews: 8,
  avgRating: 4.37,
  completedOrders: 3,
  waitlistConversionRate: 0.667,
  onTimeDeliveryRate: 0.85,
  timeSlotFulfillmentRate: 0.786,
  recipeCapacityUtilization: {
    '经典黄油曲奇': 0.65,
    '软心巧克力蛋糕': 0.88,
    '抹茶红豆司康': 0.70,
    '咸蛋黄肉松贝果': 0.55
  }
}

const stats = ref<Statistics>(mockStats)

const avgOrderValue = computed(() => {
  if (stats.value.totalOrders === 0) return '0'
  return (stats.value.totalRevenue / stats.value.totalOrders).toFixed(0)
})

const totalWaitlisted = computed(() => mockOrders.filter(o => o.status === 'waitlisted' || o.promotedAt).length)
const promotedFromWaitlist = computed(() => mockOrders.filter(o => o.promotedAt).length + 2)
const onTimeCount = computed(() => Math.round(stats.value.onTimeDeliveryRate * stats.value.completedOrders))
const totalSlotCapacity = computed(() => mockGroupBuys.reduce((sum, gb) => sum + gb.timeSlots.reduce((s, t) => s + t.capacity, 0), 0))
const totalSlotFilled = computed(() => mockGroupBuys.reduce((sum, gb) => sum + gb.timeSlots.reduce((s, t) => s + t.filled, 0), 0))

const recipeUtilList = computed(() => {
  const map = stats.value.recipeCapacityUtilization || {}
  return Object.entries(map).map(([name, rate]) => ({ name, rate: Math.round(rate * 100) }))
})

const slotDistribution = computed(() => {
  const slots: { name: string; filled: number; capacity: number }[] = []
  mockGroupBuys.forEach(gb => {
    const shortTitle = gb.title.length > 6 ? gb.title.slice(0, 6) : gb.title
    gb.timeSlots.forEach(ts => {
      slots.push({
        name: `${shortTitle} ${ts.time}`,
        filled: ts.filled,
        capacity: ts.capacity
      })
    })
  })
  return slots
})

const statusCount = computed(() => {
  const cnt: Record<string, number> = {
    waitlisted: 0,
    to_produce: 0,
    pending_pickup: 0,
    completed: 0,
    cancelled: 0,
    expired: 0
  }
  mockOrders.forEach(o => {
    if (cnt[o.status] !== undefined) cnt[o.status]++
  })
  return cnt
})

const recipeSales = computed(() => {
  const map: Record<string, number> = {}
  mockOrders.forEach(o => {
    const name = o.groupBuy?.recipe?.name || ('接龙#' + o.groupBuyId)
    map[name] = (map[name] || 0) + o.totalAmount
  })
  return Object.entries(map).map(([name, amount]) => ({ name, amount }))
})

const capacityChartOption = ref<EChartsOption>(markRaw({
  tooltip: {
    trigger: 'axis',
    formatter: (p: any) => {
      const d = p[0]
      return `${d.name}<br/>产能利用率：<b>${d.value}%</b>`
    }
  },
  grid: { left: 10, right: 20, top: 20, bottom: 40, containLabel: true },
  xAxis: {
    type: 'category',
    data: recipeUtilList.value.map(r => r.name),
    axisLabel: { color: '#8B5A3C', interval: 0, rotate: 0, fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLabel: { formatter: '{value}%', color: '#8B5A3C' },
    splitLine: { lineStyle: { color: '#F0E0D0' } }
  },
  series: [
    {
      name: '产能利用率',
      type: 'bar',
      data: recipeUtilList.value.map(r => r.rate),
      barWidth: '48%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#E8A857' },
            { offset: 1, color: '#D4622C' }
          ]
        },
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        color: '#5D3A2A',
        fontWeight: 600
      }
    }
  ]
}))

const slotChartOption = ref<EChartsOption>(markRaw({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const filled = params[0]
      const capacity = params[1]
      const rate = capacity.value > 0 ? Math.round((filled.value / capacity.value) * 100) : 0
      return `${filled.name}<br/>已分配：${filled.value}<br/>总容量：${capacity.value}<br/>履约率：<b>${rate}%</b>`
    }
  },
  legend: {
    top: 0,
    right: 0,
    textStyle: { color: '#8B5A3C' }
  },
  grid: { left: 10, right: 20, top: 40, bottom: 30, containLabel: true },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#8B5A3C' },
    splitLine: { lineStyle: { color: '#F0E0D0' } }
  },
  yAxis: {
    type: 'category',
    data: slotDistribution.value.map(s => s.name),
    axisLabel: { color: '#8B5A3C', fontSize: 11 }
  },
  series: [
    {
      name: '已分配',
      type: 'bar',
      stack: 'total',
      data: slotDistribution.value.map(s => s.filled),
      barWidth: 14,
      itemStyle: { color: '#5D8A4F', borderRadius: [0, 0, 0, 0] }
    },
    {
      name: '剩余容量',
      type: 'bar',
      stack: 'total',
      data: slotDistribution.value.map(s => Math.max(0, s.capacity - s.filled)),
      barWidth: 14,
      itemStyle: { color: '#E8D9C8', borderRadius: [0, 4, 4, 0] }
    }
  ]
}))

const statusChartOption = ref<EChartsOption>(markRaw({
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => `${p.name}：${p.value} 单 (${p.percent}%)`
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { color: '#5D3A2A' }
  },
  color: ['#E8A857', '#D4865A', '#6BA8B5', '#5D8A4F', '#B8917A', '#E85D5D'],
  series: [
    {
      type: 'pie',
      radius: ['42%', '70%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#FFF8F0',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c}单',
        color: '#5D3A2A',
        fontSize: 11
      },
      data: [
        { name: '候补中', value: statusCount.value.waitlisted },
        { name: '待生产', value: statusCount.value.to_produce },
        { name: '待取货', value: statusCount.value.pending_pickup },
        { name: '已完成', value: statusCount.value.completed },
        { name: '已取消', value: statusCount.value.cancelled },
        { name: '已失效', value: statusCount.value.expired }
      ].filter(d => d.value > 0)
    }
  ]
}))

const recipeChartOption = ref<EChartsOption>(markRaw({
  tooltip: {
    trigger: 'axis',
    formatter: (p: any) => `${p[0].name}<br/>销售额：<b>¥${p[0].value}</b>`
  },
  grid: { left: 10, right: 20, top: 10, bottom: 30, containLabel: true },
  xAxis: {
    type: 'value',
    axisLabel: { formatter: '¥{value}', color: '#8B5A3C' },
    splitLine: { lineStyle: { color: '#F0E0D0' } }
  },
  yAxis: {
    type: 'category',
    data: recipeSales.value.map(r => r.name).reverse(),
    axisLabel: { color: '#8B5A3C', fontSize: 12 }
  },
  series: [
    {
      type: 'bar',
      data: recipeSales.value.map(r => r.amount).reverse(),
      barWidth: '55%',
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#D4865A' },
            { offset: 1, color: '#E8A857' }
          ]
        },
        borderRadius: [0, 6, 6, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '¥{c}',
        color: '#5D3A2A',
        fontWeight: 600
      }
    }
  ]
}))

const fetchData = async () => {
  try {
    const res = await getStatistics()
    stats.value = res
  } catch {
    stats.value = mockStats
  }
  avgRatingDisplay.value = Math.round(stats.value.avgRating)
}

onMounted(fetchData)
</script>

<style scoped>
.statistics-page {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #5D3A2A;
  margin: 0;
}

.section-divider {
  border-color: #F0E0D0;
  font-size: 12px;
}

.section-title {
  color: #D4865A;
  font-weight: 600;
  font-size: 14px;
}

.kpi-row {
  margin-bottom: 16px;
}

.kpi-card {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%);
  border: 1px solid #F0E0D0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-card.highlight {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
}

.icon-orange { background: linear-gradient(135deg, #E8A857, #D4622C); }
.icon-green { background: linear-gradient(135deg, #8CC17D, #5D8A4F); }
.icon-brown { background: linear-gradient(135deg, #C4987A, #8B5A3C); }
.icon-purple { background: linear-gradient(135deg, #A98BC4, #7B5EA0); }

.kpi-content {
  flex: 1;
  min-width: 0;
}

.kpi-label {
  font-size: 12px;
  color: #B8917A;
  margin-bottom: 4px;
}

.kpi-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #B8917A;
}

.help-icon {
  color: #C4987A;
  cursor: help;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #5D3A2A;
  line-height: 1.2;
  margin-bottom: 4px;
}

.kpi-value.highlight-value {
  font-size: 30px;
  color: #D4622C;
}

.kpi-value.highlight-value.green {
  color: #5D8A4F;
}

.kpi-value.highlight-value.purple {
  color: #7B5EA0;
}

.kpi-trend {
  font-size: 11px;
  color: #B8917A;
  display: flex;
  align-items: center;
  gap: 2px;
}

.kpi-trend.positive {
  color: #5D8A4F;
}

.kpi-sub {
  font-size: 11px;
  color: #8B5A3C;
  margin-top: 2px;
}

.chart-row {
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
  background: #FFFDF8;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #5D3A2A;
}

.card-title {
  font-size: 15px;
}

.chart-container {
  height: 320px;
}
</style>
