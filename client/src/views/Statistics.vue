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
          <div class="kpi-value highlight-value">{{ percent(stats.waitlistConversionRate) }}%</div>
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
          <div class="kpi-value highlight-value green">{{ percent(stats.onTimeDeliveryRate) }}%</div>
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
          <div class="kpi-value highlight-value">{{ percent(stats.timeSlotFulfillmentRate) }}%</div>
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
          <v-chart :option="capacityChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">取货时段履约分布</span>
            </div>
          </template>
          <v-chart :option="slotChartOption" class="chart-container" autoresize />
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
          <v-chart :option="statusChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">食谱销售排行</span>
            </div>
          </template>
          <v-chart :option="recipeChartOption" class="chart-container" autoresize />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, markRaw } from 'vue'
import type { Statistics } from '@/types'
import { getStatistics } from '@/api/statistics'
import type { EChartsOption } from 'echarts'

const avgRatingDisplay = ref(0)

const fallbackStats: Statistics = {
  popularity: [
    { name: '经典黄油曲奇', value: 95 },
    { name: '软心巧克力蛋糕', value: 88 },
    { name: '抹茶红豆司康', value: 62 },
    { name: '咸蛋黄肉松贝果', value: 55 }
  ],
  transactionRate: [
    { name: '待生产', value: 1 }, { name: '候补中', value: 3 },
    { name: '待取货', value: 1 }, { name: '已完成', value: 3 },
    { name: '已取消', value: 1 }, { name: '已失效', value: 0 }
  ],
  durationTrend: [
    { date: '06/02', duration: 52 }, { date: '06/03', duration: 48 },
    { date: '06/04', duration: 65 }, { date: '06/05', duration: 72 },
    { date: '06/06', duration: 55 }, { date: '06/07', duration: 60 },
    { date: '06/08', duration: 58 }
  ],
  repurchaseRate: 0.605,
  totalRecipes: 4,
  totalGroupBuys: 4,
  totalOrders: 9,
  totalRevenue: 880,
  totalUsers: 6,
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
  },
  orderStatusDistribution: [
    { name: '待生产', value: 1 }, { name: '候补中', value: 3 },
    { name: '待取货', value: 1 }, { name: '已完成', value: 3 },
    { name: '已取消', value: 1 }, { name: '已失效', value: 0 }
  ],
  slotDistribution: [
    { name: '本周六黄 10:00-11:00', filled: 8, capacity: 10 },
    { name: '本周六黄 14:00-15:00', filled: 10, capacity: 12 },
    { name: '本周六黄 16:00-17:00', filled: 5, capacity: 8 },
    { name: '周末巧克 09:00-10:00', filled: 7, capacity: 8 },
    { name: '周末巧克 15:00-16:00', filled: 9, capacity: 10 },
    { name: '周三抹茶 14:00-15:00', filled: 12, capacity: 15 },
    { name: '咸蛋黄贝 11:00-12:00', filled: 15, capacity: 25 }
  ],
  recipeSales: [
    { name: '经典黄油曲奇', amount: 532 },
    { name: '软心巧克力蛋糕', amount: 348 },
    { name: '咸蛋黄肉松贝果', amount: 0 },
    { name: '抹茶红豆司康', amount: 0 }
  ]
}

const stats = ref<Statistics>(fallbackStats)

const percent = (v: number) => (v * 100).toFixed(1)

const avgOrderValue = computed(() => {
  if (stats.value.totalOrders === 0) return '0'
  return Math.round(stats.value.totalRevenue / stats.value.totalOrders).toString()
})

const totalWaitlisted = computed(() =>
  stats.value.orderStatusDistribution.find(s => s.name === '候补中')?.value || 0
)
const promotedFromWaitlist = computed(() =>
  Math.round(stats.value.waitlistConversionRate * totalWaitlisted.value)
)
const onTimeCount = computed(() =>
  Math.round(stats.value.onTimeDeliveryRate * stats.value.completedOrders)
)
const totalSlotCapacity = computed(() =>
  stats.value.slotDistribution.reduce((s, t) => s + t.capacity, 0)
)
const totalSlotFilled = computed(() =>
  stats.value.slotDistribution.reduce((s, t) => s + t.filled, 0)
)

const recipeUtilList = computed(() => {
  const map = stats.value.recipeCapacityUtilization || {}
  return Object.entries(map)
    .map(([name, rate]) => ({ name, rate: Math.round(rate * 100) }))
    .sort((a, b) => b.rate - a.rate)
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
  series: [{
    name: '产能利用率',
    type: 'bar',
    data: recipeUtilList.value.map(r => r.rate),
    barWidth: '48%',
    itemStyle: {
      color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: '#E8A857' }, { offset: 1, color: '#D4622C' }] },
      borderRadius: [6, 6, 0, 0]
    },
    label: { show: true, position: 'top', formatter: '{c}%', color: '#5D3A2A', fontWeight: 600 }
  }]
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
  legend: { top: 0, right: 0, textStyle: { color: '#8B5A3C' } },
  grid: { left: 10, right: 20, top: 40, bottom: 30, containLabel: true },
  xAxis: { type: 'value', axisLabel: { color: '#8B5A3C' }, splitLine: { lineStyle: { color: '#F0E0D0' } } },
  yAxis: {
    type: 'category',
    data: stats.value.slotDistribution.map(s => s.name),
    axisLabel: { color: '#8B5A3C', fontSize: 11 }
  },
  series: [
    {
      name: '已分配', type: 'bar', stack: 'total',
      data: stats.value.slotDistribution.map(s => s.filled),
      barWidth: 14, itemStyle: { color: '#5D8A4F', borderRadius: [0, 0, 0, 0] }
    },
    {
      name: '剩余容量', type: 'bar', stack: 'total',
      data: stats.value.slotDistribution.map(s => Math.max(0, s.capacity - s.filled)),
      barWidth: 14, itemStyle: { color: '#E8D9C8', borderRadius: [0, 4, 4, 0] }
    }
  ]
}))

const statusChartOption = ref<EChartsOption>(markRaw({
  tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}：${p.value} 单 (${p.percent}%)` },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#5D3A2A' } },
  color: ['#E8A857', '#D4865A', '#6BA8B5', '#5D8A4F', '#B8917A', '#E85D5D'],
  series: [{
    type: 'pie', radius: ['42%', '70%'], center: ['38%', '50%'],
    avoidLabelOverlap: true,
    itemStyle: { borderRadius: 6, borderColor: '#FFF8F0', borderWidth: 2 },
    label: { show: true, formatter: '{b}\n{c}单', color: '#5D3A2A', fontSize: 11 },
    data: stats.value.orderStatusDistribution.filter(d => d.value > 0)
  }]
}))

const recipeChartOption = ref<EChartsOption>(markRaw({
  tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}<br/>销售额：<b>¥${p[0].value}</b>` },
  grid: { left: 10, right: 20, top: 10, bottom: 30, containLabel: true },
  xAxis: {
    type: 'value',
    axisLabel: { formatter: '¥{value}', color: '#8B5A3C' },
    splitLine: { lineStyle: { color: '#F0E0D0' } }
  },
  yAxis: {
    type: 'category',
    data: stats.value.recipeSales.map(r => r.name).reverse(),
    axisLabel: { color: '#8B5A3C', fontSize: 12 }
  },
  series: [{
    type: 'bar',
    data: stats.value.recipeSales.map(r => r.amount).reverse(),
    barWidth: '55%',
    itemStyle: {
      color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
        colorStops: [{ offset: 0, color: '#D4865A' }, { offset: 1, color: '#E8A857' }] },
      borderRadius: [0, 6, 6, 0]
    },
    label: { show: true, position: 'right', formatter: '¥{c}', color: '#5D3A2A', fontWeight: 600 }
  }]
}))

const refreshCharts = () => {
  capacityChartOption.value = markRaw({
    ...capacityChartOption.value,
    xAxis: { ...(capacityChartOption.value.xAxis as any), data: recipeUtilList.value.map(r => r.name) },
    series: [{ ...(capacityChartOption.value.series as any)[0], data: recipeUtilList.value.map(r => r.rate) }]
  })
  slotChartOption.value = markRaw({
    ...slotChartOption.value,
    yAxis: { ...(slotChartOption.value.yAxis as any), data: stats.value.slotDistribution.map(s => s.name) },
    series: [
      { ...(slotChartOption.value.series as any)[0], data: stats.value.slotDistribution.map(s => s.filled) },
      { ...(slotChartOption.value.series as any)[1], data: stats.value.slotDistribution.map(s => Math.max(0, s.capacity - s.filled)) }
    ]
  })
  statusChartOption.value = markRaw({
    ...statusChartOption.value,
    series: [{ ...(statusChartOption.value.series as any)[0], data: stats.value.orderStatusDistribution.filter(d => d.value > 0) }]
  })
  recipeChartOption.value = markRaw({
    ...recipeChartOption.value,
    yAxis: { ...(recipeChartOption.value.yAxis as any), data: stats.value.recipeSales.map(r => r.name).reverse() },
    series: [{ ...(recipeChartOption.value.series as any)[0], data: stats.value.recipeSales.map(r => r.amount).reverse() }]
  })
}

watch(stats, () => {
  avgRatingDisplay.value = Math.round(stats.value.avgRating)
  refreshCharts()
}, { deep: true })

const fetchData = async () => {
  try {
    const res = await getStatistics()
    if (res && typeof res === 'object' && 'totalOrders' in res) {
      stats.value = res
    } else {
      stats.value = fallbackStats
    }
  } catch {
    stats.value = fallbackStats
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
