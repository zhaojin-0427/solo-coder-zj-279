<template>
  <div class="statistics-page">
    <el-row :gutter="20">
      <el-col :xs="12" :sm="6" v-for="card in statCards" :key="card.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon :size="26" color="#fff">
              <component :is="card.icon" />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <el-icon color="#D4865A"><TrendCharts /></el-icon>
              <span>食谱受欢迎度排行</span>
            </div>
          </template>
          <div ref="popularityChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <el-icon color="#D4865A"><PieChart /></el-icon>
              <span>订单成交率分布</span>
            </div>
          </template>
          <div ref="rateChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <el-icon color="#D4865A"><DataLine /></el-icon>
              <span>制作时长趋势</span>
            </div>
          </template>
          <div ref="durationChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <el-icon color="#D4865A"><RefreshRight /></el-icon>
              <span>复购率指标</span>
            </div>
          </template>
          <div class="repurchase-box">
            <div class="gauge-container">
              <div ref="repurchaseChartRef" class="gauge-chart"></div>
            </div>
            <div class="repurchase-tips">
              <div class="tip-item">
                <span class="tip-label">本月复购用户</span>
                <span class="tip-value">86 人</span>
              </div>
              <div class="tip-item">
                <span class="tip-label">总购买用户</span>
                <span class="tip-value">142 人</span>
              </div>
              <div class="tip-item highlight">
                <span class="tip-label">较上月</span>
                <span class="tip-value up">↑ 8.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import type { Statistics } from '@/types'
import { getStatistics } from '@/api/statistics'

const popularityChartRef = ref<HTMLElement>()
const rateChartRef = ref<HTMLElement>()
const durationChartRef = ref<HTMLElement>()
const repurchaseChartRef = ref<HTMLElement>()

const mockStats: Statistics = {
  popularity: [
    { name: '经典黄油曲奇', value: 128 },
    { name: '软心巧克力蛋糕', value: 96 },
    { name: '日式抹茶红豆包', value: 85 },
    { name: '法式马卡龙', value: 72 },
    { name: '提拉米苏', value: 64 },
    { name: '芝士蛋糕', value: 58 }
  ],
  transactionRate: [
    { name: '已完成', value: 68 },
    { name: '已付款', value: 18 },
    { name: '待付款', value: 10 },
    { name: '已取消', value: 4 }
  ],
  durationTrend: [
    { date: '12/22', duration: 52 },
    { date: '12/23', duration: 48 },
    { date: '12/24', duration: 65 },
    { date: '12/25', duration: 72 },
    { date: '12/26', duration: 55 },
    { date: '12/27', duration: 60 },
    { date: '12/28', duration: 58 }
  ],
  repurchaseRate: 60.5,
  totalRecipes: 24,
  totalGroupBuys: 58,
  totalOrders: 432,
  totalRevenue: 28560
}

const stats = ref<Statistics>(mockStats)

const statCards = computed(() => [
  { label: '食谱总数', value: stats.value.totalRecipes, icon: 'Notebook', color: '#D4622C' },
  { label: '接龙活动', value: stats.value.totalGroupBuys, icon: 'Goods', color: '#E8A857' },
  { label: '订单总数', value: stats.value.totalOrders, icon: 'ShoppingCart', color: '#8FAF6B' },
  { label: '累计收入', value: '¥' + stats.value.totalRevenue.toLocaleString(), icon: 'Wallet', color: '#6B8FAF' }
])

const WARM_COLORS = ['#D4622C', '#E8A857', '#FFB88A', '#F5A623', '#C68B59', '#B8704A']

const initPopularityChart = () => {
  if (!popularityChartRef.value) return
  const chart = echarts.init(popularityChartRef.value)
  const data = stats.value.popularity.slice().reverse()
  chart.setOption({
    grid: { left: 110, right: 30, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#F0E0D0' } },
      axisLabel: { color: '#8B5A3C' },
      splitLine: { lineStyle: { color: '#F5E6D3' } }
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: { lineStyle: { color: '#F0E0D0' } },
      axisLabel: { color: '#5D3A2A', fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: data.map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#FFB88A' },
            { offset: 1, color: WARM_COLORS[i % WARM_COLORS.length] }
          ]),
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        color: '#5D3A2A',
        fontSize: 12
      }
    }]
  })
  return chart
}

const initRateChart = () => {
  if (!rateChartRef.value) return
  const chart = echarts.init(rateChartRef.value)
  const colors = ['#8FAF6B', '#6B8FAF', '#E8A857', '#B8917A']
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: '#5D3A2A', fontSize: 12 }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{d}%',
        color: '#5D3A2A',
        fontSize: 13,
        fontWeight: 600
      },
      labelLine: { length: 8, length2: 8, lineStyle: { color: '#D4865A' } },
      data: stats.value.transactionRate.map((d, i) => ({
        value: d.value,
        name: d.name,
        itemStyle: { color: colors[i] }
      }))
    }]
  })
  return chart
}

const initDurationChart = () => {
  if (!durationChartRef.value) return
  const chart = echarts.init(durationChartRef.value)
  chart.setOption({
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: stats.value.durationTrend.map(d => d.date),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#F0E0D0' } },
      axisLabel: { color: '#8B5A3C' }
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: '#8B5A3C', fontSize: 12 },
      axisLine: { show: false },
      axisLabel: { color: '#8B5A3C' },
      splitLine: { lineStyle: { color: '#F5E6D3' } }
    },
    series: [{
      type: 'line',
      data: stats.value.durationTrend.map(d => d.duration),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#D4622C', width: 3 },
      itemStyle: { color: '#D4622C', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(212, 98, 44, 0.3)' },
          { offset: 1, color: 'rgba(212, 98, 44, 0.02)' }
        ])
      }
    }]
  })
  return chart
}

const initRepurchaseChart = () => {
  if (!repurchaseChartRef.value) return
  const chart = echarts.init(repurchaseChartRef.value)
  chart.setOption({
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '90%',
      progress: {
        show: true,
        width: 18,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#FFB88A' },
            { offset: 1, color: '#D4622C' }
          ])
        }
      },
      axisLine: {
        lineStyle: { width: 18, color: [[1, '#F5E6D3']] }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      anchor: { show: false },
      title: { show: false },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '0%'],
        fontSize: 36,
        fontWeight: 700,
        color: '#D4622C',
        formatter: '{value}%'
      },
      data: [{ value: stats.value.repurchaseRate }]
    }]
  })
  return chart
}

const fetchData = async () => {
  try {
    const data = await getStatistics()
    if (data && data.popularity) stats.value = data
  } catch {}
}

const charts: echarts.ECharts[] = []

const handleResize = () => {
  charts.forEach(c => c.resize())
}

onMounted(async () => {
  await fetchData()
  await nextTick()
  charts.push(initPopularityChart() as any)
  charts.push(initRateChart() as any)
  charts.push(initDurationChart() as any)
  charts.push(initRepurchaseChart() as any)
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-page {
  padding: 0;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #8B5A3C;
}

.chart-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
  margin-bottom: 0;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #5D3A2A;
  font-size: 15px;
}

.chart-box {
  width: 100%;
  height: 300px;
}

.repurchase-box {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
}

.gauge-container {
  flex: 1;
}

.gauge-chart {
  width: 100%;
  height: 260px;
}

.repurchase-tips {
  width: 150px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tip-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #FFF8F0;
  border-radius: 8px;
}

.tip-item.highlight {
  background: linear-gradient(135deg, #FFF5EB, #FFE8D6);
}

.tip-label {
  font-size: 12px;
  color: #8B5A3C;
}

.tip-value {
  font-size: 14px;
  font-weight: 600;
  color: #5D3A2A;
}

.tip-value.up {
  color: #8FAF6B;
}
</style>
