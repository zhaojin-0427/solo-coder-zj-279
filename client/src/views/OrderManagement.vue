<template>
  <div class="order-management">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="接龙列表" name="groupbuys">
        <el-row :gutter="20">
          <el-col
            v-for="gb in groupBuys"
            :key="gb.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="8"
            style="margin-bottom: 20px"
          >
            <GroupBuyCard :group-buy="gb" @order="handleOrder" @close="handleCloseGb" @expand="handleExpandGb" />
          </el-col>
        </el-row>
        <el-empty v-if="groupBuys.length === 0" description="暂无接龙" />
      </el-tab-pane>

      <el-tab-pane label="订单管理" name="orders">
        <el-card class="table-card">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px">
              <div style="display: flex; align-items: center; gap: 10px">
                <span style="font-weight: 600; color: #5D3A2A; font-size: 16px">订单管理</span>
                <el-tag type="warning" effect="light">共 {{ orders.length }} 条</el-tag>
              </div>
              <el-radio-group v-model="orderFilter" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="to_produce">待生产</el-radio-button>
                <el-radio-button value="waitlisted">候补中</el-radio-button>
                <el-radio-button value="pending_pickup">待取货</el-radio-button>
                <el-radio-button value="completed">已完成</el-radio-button>
                <el-radio-button value="expired">已失效</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div v-for="group in groupedOrders" :key="group.status" class="status-group" v-loading="loading">
            <div class="group-header">
              <el-tag :type="statusType(group.status)" effect="dark" round>
                {{ statusText(group.status) }}
              </el-tag>
              <span class="group-count">{{ group.orders.length }} 条</span>
            </div>
            <el-table :data="group.orders" stripe style="width: 100%" class="order-table">
              <el-table-column prop="id" label="订单号" width="90" />
              <el-table-column label="接龙活动" min-width="180">
                <template #default="{ row }">
                  <span style="color: #5D3A2A; font-weight: 500">
                    {{ row.groupBuy?.title || '#' + row.groupBuyId }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="userName" label="下单人" width="100" />
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column label="取货时段" width="110">
                <template #default="{ row }">
                  <el-tag v-if="row.timeSlotId && row.groupBuy" size="small" effect="plain">
                    {{ row.groupBuy.timeSlots?.find(t => t.id === row.timeSlotId)?.time || '-' }}
                  </el-tag>
                  <span v-else style="color: #B8917A">-</span>
                </template>
              </el-table-column>
              <el-table-column label="候补位次" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'waitlisted' && row.waitlistPosition" type="warning" effect="light" size="small">
                    第 {{ row.waitlistPosition }} 位
                  </el-tag>
                  <span v-else style="color: #B8917A">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" width="80" align="center">
                <template #default="{ row }">
                  <el-tag type="warning" effect="plain">{{ row.quantity }} 份</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="totalAmount" label="金额" width="100">
                <template #default="{ row }">
                  <span style="color: #D4622C; font-weight: 600">¥{{ row.totalAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="110">
                <template #default="{ row }">
                  <el-tag :type="statusType(row.status)" effect="light">
                    {{ statusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="下单时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="260" fixed="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'to_produce'"
                    size="small"
                    type="primary"
                    plain
                    @click="handleMarkReady(row.id)"
                  >
                    制作完成
                  </el-button>
                  <el-button
                    v-if="row.status === 'pending_pickup'"
                    size="small"
                    type="success"
                    @click="handleUpdateStatus(row.id, 'completed')"
                  >
                    确认取货
                  </el-button>
                  <el-button
                    v-if="row.status === 'waitlisted'"
                    size="small"
                    type="warning"
                    plain
                    @click="handleUpdateStatus(row.id, 'cancelled')"
                  >
                    退出候补
                  </el-button>
                  <el-button
                    v-if="['to_produce', 'pending_pickup', 'waitlisted'].includes(row.status)"
                    size="small"
                    type="danger"
                    plain
                    @click="handleDeleteOrder(row.id)"
                  >
                    取消/删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-if="filteredOrders.length === 0" description="暂无符合条件的订单" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showOrderDialog" title="下单" width="520px" :close-on-click-modal="false">
      <div v-if="selectedGb" class="order-info">
        <div class="gb-summary">
          <el-image :src="selectedGb.recipe?.imageUrl" fit="cover" class="gb-img" />
          <div class="gb-detail">
            <h4>{{ selectedGb.title }}</h4>
            <p>单价: <span style="color: #D4622C; font-weight: 600">¥{{ selectedGb.unitPrice }}</span> / 份</p>
            <div class="capacity-info">
              <el-tag size="small" type="success" effect="plain">
                剩余 {{ selectedGb.maxQuantity - selectedGb.currentQuantity }} 份
              </el-tag>
              <el-tag v-if="selectedGb.allowWaitlist && selectedGb.waitlistQuantity > 0" size="small" type="warning" effect="plain">
                候补 {{ selectedGb.waitlistQuantity }} 份
              </el-tag>
              <el-tag size="small" type="info" effect="plain">
                制作 {{ selectedGb.recipe?.duration || 0 }} 分钟
              </el-tag>
              <el-tag size="small" type="info" effect="plain">
                保存 {{ selectedGb.recipe?.shelfLife || '-' }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-alert
          v-if="eligibility"
          :type="eligibility.canPlace ? (eligibility.status === 'waitlisted' ? 'warning' : 'success') : 'error'"
          :closable="false"
          :title="eligibility.message"
          style="margin: 14px 0"
          show-icon
        />

        <el-divider />
        <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="90px">
          <el-form-item label="姓名" prop="userName">
            <el-input v-model="orderForm.userName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="orderForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="数量" prop="quantity">
            <el-input-number
              v-model="orderForm.quantity"
              :min="1"
              :max="99"
              @change="checkEligibility"
            />
          </el-form-item>
          <el-form-item label="取货时段" prop="timeSlotId">
            <el-select v-model="orderForm.timeSlotId" placeholder="请选择取货时段" style="width: 220px">
              <el-option
                v-for="ts in availableTimeSlots"
                :key="ts.id"
                :label="`${ts.time} (剩余${ts.capacity - ts.filled}份)`"
                :value="ts.id"
                :disabled="ts.filled >= ts.capacity"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="合计">
            <span style="color: #D4622C; font-size: 20px; font-weight: 600">
              ¥{{ (orderForm.quantity * selectedGb.unitPrice).toFixed(2) }}
            </span>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showOrderDialog = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!eligibility?.canPlace"
          @click="submitOrder"
        >
          {{ eligibility?.status === 'waitlisted' ? '加入候补' : '确认下单' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showExpandDialog" title="扩容接龙名额" width="420px">
      <div v-if="expandGb" style="padding: 10px 0">
        <p style="color: #5D3A2A; margin-bottom: 12px">
          当前接龙：<strong>{{ expandGb.title }}</strong>
        </p>
        <p style="color: #8B5A3C; margin-bottom: 16px; font-size: 13px">
          当前上限 {{ expandGb.maxQuantity }} 份，已订 {{ expandGb.currentQuantity }} 份，
          <span v-if="expandGb.waitlistQuantity > 0" style="color: #E8A857">候补 {{ expandGb.waitlistQuantity }} 份</span>
          <span v-else>暂无候补</span>
        </p>
        <el-form label-width="100px">
          <el-form-item label="扩容数量">
            <el-input-number v-model="expandQuantity" :min="1" :max="50" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showExpandDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmExpand">确认扩容</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import GroupBuyCard from '@/components/GroupBuyCard.vue'
import { getGroupBuys, closeGroupBuy, expandGroupBuyCapacity, type GroupBuy } from '@/api/groupBuys'
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  markReadyForPickup,
  checkOrderEligibility,
  type CreateOrderDto,
  type EligibilityResult
} from '@/api/orders'
import type { Order, OrderStatus, Recipe, TimeSlot } from '@/types'

const activeTab = ref('groupbuys')
const loading = ref(false)
const groupBuys = ref<GroupBuy[]>([])
const orders = ref<Order[]>([])
const orderFilter = ref<OrderStatus | 'all'>('all')

const showOrderDialog = ref(false)
const selectedGb = ref<GroupBuy | null>(null)
const orderFormRef = ref<FormInstance>()
const eligibility = ref<EligibilityResult | null>(null)

const showExpandDialog = ref(false)
const expandGb = ref<GroupBuy | null>(null)
const expandQuantity = ref(5)

const mockRecipes: Recipe[] = [
  { id: 1, name: '经典黄油曲奇', description: '', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', ingredients: [], steps: [], cost: 25, duration: 60, shelfLife: '7天', createdAt: '', updatedAt: '' },
  { id: 2, name: '软心巧克力蛋糕', description: '', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', ingredients: [], steps: [], cost: 35, duration: 45, shelfLife: '当天', createdAt: '', updatedAt: '' },
  { id: 3, name: '日式抹茶红豆包', description: '', imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400', ingredients: [], steps: [], cost: 20, duration: 180, shelfLife: '3天', createdAt: '', updatedAt: '' }
]

const mockTimeSlots: TimeSlot[] = [
  { id: 1, time: '14:00', capacity: 15, filled: 8 },
  { id: 2, time: '16:00', capacity: 15, filled: 10 }
]

const mockGroupBuys: GroupBuy[] = [
  { id: 1, recipeId: 1, recipe: mockRecipes[0], title: '本周六黄油曲奇接龙', maxQuantity: 30, currentQuantity: 18, waitlistQuantity: 2, pickupTime: '2026-06-10T15:00:00', productionDeadline: '2026-06-10T10:00:00', dailyBatches: 3, allowWaitlist: true, timeSlots: mockTimeSlots, paymentMethod: 'wechat', status: 'active', unitPrice: 38, createdAt: '2026-06-05T10:00:00', updatedAt: '2026-06-05T10:00:00' },
  { id: 2, recipeId: 2, recipe: mockRecipes[1], title: '周末巧克力熔岩蛋糕', maxQuantity: 20, currentQuantity: 20, waitlistQuantity: 3, pickupTime: '2026-06-09T10:00:00', productionDeadline: '2026-06-09T08:00:00', dailyBatches: 2, allowWaitlist: true, timeSlots: [{ id: 1, time: '09:30', capacity: 10, filled: 10 }, { id: 2, time: '11:00', capacity: 10, filled: 10 }], paymentMethod: 'alipay', status: 'active', unitPrice: 58, createdAt: '2026-06-03T10:00:00', updatedAt: '2026-06-03T10:00:00' },
  { id: 3, recipeId: 3, recipe: mockRecipes[2], title: '周末抹茶红豆包', maxQuantity: 25, currentQuantity: 12, waitlistQuantity: 0, pickupTime: '2026-06-04T14:00:00', productionDeadline: '2026-06-04T09:00:00', dailyBatches: 4, allowWaitlist: false, timeSlots: [{ id: 1, time: '13:00', capacity: 13, filled: 6 }, { id: 2, time: '15:00', capacity: 12, filled: 6 }], paymentMethod: 'cash', status: 'completed', unitPrice: 28, createdAt: '2026-05-30T10:00:00', updatedAt: '2026-06-04T18:00:00' }
]

const mockOrders: Order[] = [
  { id: 1001, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 2, userName: '小明', phone: '13800138001', quantity: 2, totalAmount: 76, status: 'completed', pickedUpAt: '2026-06-04T14:30:00', timeSlotId: 1, createdAt: '2026-06-05T12:00:00', updatedAt: '2026-06-04T14:30:00' },
  { id: 1002, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 3, userName: '小红', phone: '13800138002', quantity: 3, totalAmount: 114, status: 'to_produce', timeSlotId: 2, createdAt: '2026-06-06T09:30:00', updatedAt: '2026-06-06T09:35:00' },
  { id: 1003, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 1, userName: '小刚', phone: '13800138003', quantity: 1, totalAmount: 58, status: 'waitlisted', waitlistPosition: 1, createdAt: '2026-06-06T14:20:00', updatedAt: '2026-06-06T14:20:00' },
  { id: 1004, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 2, userName: '小美', phone: '13800138004', quantity: 5, totalAmount: 190, status: 'pending_pickup', timeSlotId: 1, createdAt: '2026-06-06T16:45:00', updatedAt: '2026-06-07T10:00:00' },
  { id: 1005, groupBuyId: 3, groupBuy: mockGroupBuys[2], userId: 3, userName: '小李', phone: '13800138005', quantity: 4, totalAmount: 112, status: 'cancelled', createdAt: '2026-05-31T11:00:00', updatedAt: '2026-05-31T15:00:00' },
  { id: 1006, groupBuyId: 3, groupBuy: mockGroupBuys[2], userId: 2, userName: '阿华', phone: '13800138006', quantity: 2, totalAmount: 56, status: 'completed', pickedUpAt: '2026-06-04T13:30:00', timeSlotId: 1, createdAt: '2026-06-01T10:00:00', updatedAt: '2026-06-04T13:30:00' },
  { id: 1007, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 3, userName: '小林', phone: '13800138007', quantity: 2, totalAmount: 116, status: 'waitlisted', waitlistPosition: 2, createdAt: '2026-06-06T15:00:00', updatedAt: '2026-06-06T15:00:00' },
  { id: 1008, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 2, userName: '阿杰', phone: '13800138008', quantity: 1, totalAmount: 58, status: 'waitlisted', waitlistPosition: 3, createdAt: '2026-06-06T16:30:00', updatedAt: '2026-06-06T16:30:00' },
  { id: 1009, groupBuyId: 3, groupBuy: mockGroupBuys[2], userId: 1, userName: '老王', phone: '13800138009', quantity: 3, totalAmount: 84, status: 'expired', timeSlotId: 2, createdAt: '2026-06-02T08:00:00', updatedAt: '2026-06-05T00:00:00' }
]

const orderForm = ref<CreateOrderDto>({
  groupBuyId: 0,
  userName: '',
  phone: '',
  quantity: 1,
  timeSlotId: undefined
})

const orderRules: FormRules = {
  userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const availableTimeSlots = computed(() => {
  return selectedGb.value?.timeSlots || []
})

const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === orderFilter.value)
})

const groupedOrders = computed(() => {
  const statusOrder: OrderStatus[] = ['to_produce', 'waitlisted', 'pending_pickup', 'completed', 'cancelled', 'expired', 'pending_payment']
  const groups: { status: OrderStatus; orders: Order[] }[] = []
  const list = filteredOrders.value
  statusOrder.forEach(s => {
    const os = list.filter(o => o.status === s)
    if (os.length > 0) groups.push({ status: s, orders: os })
  })
  return groups
})

const statusType = (s: OrderStatus) => {
  const map: Record<string, any> = {
    pending_payment: 'warning',
    to_produce: 'primary',
    waitlisted: 'warning',
    pending_pickup: 'warning',
    completed: 'success',
    cancelled: 'info',
    expired: 'danger'
  }
  return map[s] || 'info'
}

const statusText = (s: OrderStatus) => {
  const map: Record<string, string> = {
    pending_payment: '待付款',
    to_produce: '待生产',
    waitlisted: '候补中',
    pending_pickup: '待取货',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已失效'
  }
  return map[s] || s
}

const formatTime = (t: string) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const g = await getGroupBuys()
    groupBuys.value = g.length ? g : mockGroupBuys
  } catch {
    groupBuys.value = mockGroupBuys
  }
  try {
    const o = await getOrders()
    orders.value = o.length ? o : mockOrders
  } catch {
    orders.value = mockOrders
  }
  loading.value = false
}

const checkEligibility = async () => {
  if (!selectedGb.value) return
  try {
    eligibility.value = await checkOrderEligibility(selectedGb.value.id, orderForm.value.quantity)
  } catch {
    eligibility.value = {
      status: 'to_produce',
      message: '正式名额可用',
      canPlace: true
    }
  }
}

const handleOrder = (gb: GroupBuy) => {
  selectedGb.value = gb
  orderForm.value = {
    groupBuyId: gb.id,
    userName: '',
    phone: '',
    quantity: 1,
    timeSlotId: gb.timeSlots?.[0]?.id
  }
  eligibility.value = null
  showOrderDialog.value = true
  checkEligibility()
}

watch(() => orderForm.value.quantity, checkEligibility)

const submitOrder = async () => {
  if (!orderFormRef.value || !selectedGb.value) return
  await orderFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const result = await createOrder(orderForm.value)
        ElMessage.success(result.statusMessage || '下单成功')
        if (result.order.status === 'waitlisted') {
          ElMessage.info(`您已进入候补队列，当前为第 ${result.order.waitlistPosition || '?'} 位`)
        }
        showOrderDialog.value = false
        fetchData()
      } catch (e: any) {
        ElMessage.error(e?.response?.data?.message || '下单失败')
      }
    }
  })
}

const handleUpdateStatus = async (id: number, status: OrderStatus) => {
  try {
    const result = await updateOrderStatus(id, status)
    if (result.promotedCount > 0) {
      ElMessage.success(`状态更新成功，已有 ${result.promotedCount} 个候补订单自动转正`)
    } else {
      ElMessage.success('状态更新成功')
    }
    fetchData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '状态更新失败')
  }
}

const handleMarkReady = async (id: number) => {
  try {
    await markReadyForPickup(id)
    ElMessage.success('已标记为待取货，请通知邻居取货')
    fetchData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  }
}

const handleDeleteOrder = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定取消/删除该订单吗？取消后候补订单将自动补位。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const result = await deleteOrder(id)
    if (result.promotedCount > 0) {
      ElMessage.success(`删除成功，已有 ${result.promotedCount} 个候补订单自动转正`)
    } else {
      ElMessage.success('删除成功')
    }
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.message || '删除失败')
    }
  }
}

const handleCloseGb = async (gb: GroupBuy) => {
  try {
    await ElMessageBox.confirm('截单后候补订单将自动失效，确定要截单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await closeGroupBuy(gb.id)
    ElMessage.success('已截单')
    fetchData()
  } catch (e: any) {
    if (e !== 'cancel') {
      const found = groupBuys.value.find(g => g.id === gb.id)
      if (found) found.status = 'closed'
      ElMessage.success('已截单')
    }
  }
}

const handleExpandGb = (gb: GroupBuy) => {
  expandGb.value = gb
  expandQuantity.value = Math.max(5, Math.ceil(gb.waitlistQuantity || 5))
  showExpandDialog.value = true
}

const confirmExpand = async () => {
  if (!expandGb.value) return
  try {
    const result = await expandGroupBuyCapacity(expandGb.value.id, expandQuantity.value)
    if (result.promotedCount > 0) {
      ElMessage.success(`扩容成功，已有 ${result.promotedCount} 个候补订单自动转正`)
    } else {
      ElMessage.success('扩容成功')
    }
    showExpandDialog.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '扩容失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.order-management {
  padding: 0;
}

.main-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  color: #8B5A3C;
}

.main-tabs :deep(.el-tabs__item.is-active) {
  color: #D4622C;
}

.main-tabs :deep(.el-tabs__active-bar) {
  background-color: #D4622C;
}

.table-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
}

.status-group {
  margin-bottom: 20px;
}

.status-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-left: 4px;
}

.group-count {
  font-size: 13px;
  color: #8B5A3C;
}

.order-table {
  border-radius: 8px;
  overflow: hidden;
}

.order-info {
  padding: 4px;
}

.gb-summary {
  display: flex;
  gap: 14px;
  align-items: center;
}

.gb-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}

.gb-detail h4 {
  margin: 0 0 8px;
  color: #5D3A2A;
  font-size: 16px;
}

.gb-detail p {
  margin: 4px 0;
  color: #8B5A3C;
  font-size: 13px;
}

.capacity-info {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}
</style>
