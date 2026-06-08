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
            <GroupBuyCard :group-buy="gb" @order="handleOrder" @close="handleCloseGb" />
          </el-col>
        </el-row>
        <el-empty v-if="groupBuys.length === 0" description="暂无接龙" />
      </el-tab-pane>

      <el-tab-pane label="订单列表" name="orders">
        <el-card class="table-card">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-weight: 600; color: #5D3A2A; font-size: 16px">全部订单</span>
              <el-tag type="warning" effect="light">共 {{ orders.length }} 条订单</el-tag>
            </div>
          </template>
          <el-table :data="orders" stripe style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="订单号" width="90" />
            <el-table-column label="接龙活动" min-width="180">
              <template #default="{ row }">
                <span style="color: #5D3A2A; font-weight: 500">
                  {{ row.groupBuy?.title || '#' + row.groupBuyId }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="下单人" width="110" />
            <el-table-column prop="phone" label="联系电话" width="140" />
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
            <el-table-column label="下单时间" width="170">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  size="small"
                  type="success"
                  @click="handleUpdateStatus(row.id, 'paid')"
                >
                  标记已付
                </el-button>
                <el-button
                  v-if="row.status === 'paid'"
                  size="small"
                  type="primary"
                  @click="handleUpdateStatus(row.id, 'completed')"
                >
                  完成
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  @click="handleDeleteOrder(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showOrderDialog" title="下单" width="480px" :close-on-click-modal="false">
      <div v-if="selectedGb" class="order-info">
        <div class="gb-summary">
          <el-image :src="selectedGb.recipe?.imageUrl" fit="cover" class="gb-img" />
          <div class="gb-detail">
            <h4>{{ selectedGb.title }}</h4>
            <p>单价: <span style="color: #D4622C; font-weight: 600">¥{{ selectedGb.unitPrice }}</span> / 份</p>
            <p>剩余: <el-tag size="small" type="success" effect="plain">
              {{ selectedGb.maxQuantity - selectedGb.currentQuantity }} 份
            </el-tag></p>
          </div>
        </div>
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
              :max="selectedGb.maxQuantity - selectedGb.currentQuantity"
            />
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
        <el-button type="primary" @click="submitOrder">确认下单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import GroupBuyCard from '@/components/GroupBuyCard.vue'
import { getGroupBuys, closeGroupBuy, type GroupBuy } from '@/api/groupBuys'
import { getOrders, createOrder, updateOrderStatus, deleteOrder, type CreateOrderDto } from '@/api/orders'
import type { Order, Recipe } from '@/types'

const activeTab = ref('groupbuys')
const loading = ref(false)
const groupBuys = ref<GroupBuy[]>([])
const orders = ref<Order[]>([])
const showOrderDialog = ref(false)
const selectedGb = ref<GroupBuy | null>(null)
const orderFormRef = ref<FormInstance>()

const mockRecipes: Recipe[] = [
  { id: 1, name: '经典黄油曲奇', description: '', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', ingredients: [], steps: [], cost: 25, duration: 60, shelfLife: '7天', createdAt: '', updatedAt: '' },
  { id: 2, name: '软心巧克力蛋糕', description: '', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', ingredients: [], steps: [], cost: 35, duration: 45, shelfLife: '当天', createdAt: '', updatedAt: '' },
  { id: 3, name: '日式抹茶红豆包', description: '', imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400', ingredients: [], steps: [], cost: 20, duration: 180, shelfLife: '3天', createdAt: '', updatedAt: '' }
]

const mockGroupBuys: GroupBuy[] = [
  { id: 1, recipeId: 1, recipe: mockRecipes[0], title: '本周六黄油曲奇接龙', maxQuantity: 30, currentQuantity: 18, pickupTime: '2024-12-28T15:00:00', paymentMethod: 'wechat', status: 'active', unitPrice: 38, createdAt: '2024-12-20T10:00:00', updatedAt: '2024-12-20T10:00:00' },
  { id: 2, recipeId: 2, recipe: mockRecipes[1], title: '圣诞限定巧克力蛋糕', maxQuantity: 20, currentQuantity: 20, pickupTime: '2024-12-25T10:00:00', paymentMethod: 'alipay', status: 'active', unitPrice: 58, createdAt: '2024-12-18T10:00:00', updatedAt: '2024-12-18T10:00:00' },
  { id: 3, recipeId: 3, recipe: mockRecipes[2], title: '周末抹茶红豆包', maxQuantity: 25, currentQuantity: 12, pickupTime: '2024-12-29T14:00:00', paymentMethod: 'cash', status: 'closed', unitPrice: 28, createdAt: '2024-12-15T10:00:00', updatedAt: '2024-12-15T10:00:00' }
]

const mockOrders: Order[] = [
  { id: 1001, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小明', phone: '13800138001', quantity: 2, totalAmount: 76, status: 'completed', createdAt: '2024-12-20T12:00:00', updatedAt: '2024-12-20T12:00:00' },
  { id: 1002, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 2, userName: '小红', phone: '13800138002', quantity: 3, totalAmount: 114, status: 'paid', createdAt: '2024-12-21T09:30:00', updatedAt: '2024-12-21T09:30:00' },
  { id: 1003, groupBuyId: 2, groupBuy: mockGroupBuys[1], userId: 3, userName: '小刚', phone: '13800138003', quantity: 1, totalAmount: 58, status: 'pending', createdAt: '2024-12-22T14:20:00', updatedAt: '2024-12-22T14:20:00' },
  { id: 1004, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 4, userName: '小美', phone: '13800138004', quantity: 5, totalAmount: 190, status: 'completed', createdAt: '2024-12-22T16:45:00', updatedAt: '2024-12-22T16:45:00' },
  { id: 1005, groupBuyId: 3, groupBuy: mockGroupBuys[2], userId: 5, userName: '小李', phone: '13800138005', quantity: 4, totalAmount: 112, status: 'cancelled', createdAt: '2024-12-16T11:00:00', updatedAt: '2024-12-16T11:00:00' }
]

const orderForm = ref<CreateOrderDto>({
  groupBuyId: 0,
  userName: '',
  phone: '',
  quantity: 1
})

const orderRules: FormRules = {
  userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
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

const statusType = (s: Order['status']) => {
  const map: Record<string, any> = {
    pending: 'warning',
    paid: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[s]
}

const statusText = (s: Order['status']) => {
  const map: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[s]
}

const formatTime = (t: string) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleOrder = (gb: GroupBuy) => {
  selectedGb.value = gb
  orderForm.value = {
    groupBuyId: gb.id,
    userName: '',
    phone: '',
    quantity: 1
  }
  showOrderDialog.value = true
}

const submitOrder = async () => {
  if (!orderFormRef.value || !selectedGb.value) return
  await orderFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createOrder(orderForm.value)
        ElMessage.success('下单成功')
        showOrderDialog.value = false
        fetchData()
      } catch {
        const newOrder: Order = {
          id: Date.now(),
          groupBuyId: orderForm.value.groupBuyId,
          groupBuy: selectedGb.value,
          userId: 1,
          userName: orderForm.value.userName,
          phone: orderForm.value.phone,
          quantity: orderForm.value.quantity,
          totalAmount: orderForm.value.quantity * selectedGb.value.unitPrice,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        orders.value.unshift(newOrder)
        const gb = groupBuys.value.find(g => g.id === selectedGb.value?.id)
        if (gb) {
          gb.currentQuantity += orderForm.value.quantity
          if (gb.currentQuantity >= gb.maxQuantity) {
            gb.status = 'closed'
            ElMessage.info('该接龙已自动截单（满额）')
          }
        }
        ElMessage.success('下单成功')
        showOrderDialog.value = false
      }
    }
  })
}

const handleUpdateStatus = async (id: number, status: Order['status']) => {
  try {
    await updateOrderStatus(id, status)
    ElMessage.success('状态更新成功')
    fetchData()
  } catch {
    const found = orders.value.find(o => o.id === id)
    if (found) found.status = status
    ElMessage.success('状态更新成功')
  }
}

const handleDeleteOrder = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteOrder(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    orders.value = orders.value.filter(o => o.id !== id)
    ElMessage.success('删除成功')
  }
}

const handleCloseGb = async (gb: GroupBuy) => {
  try {
    await closeGroupBuy(gb.id)
    ElMessage.success('已截单')
    fetchData()
  } catch {
    const found = groupBuys.value.find(g => g.id === gb.id)
    if (found) found.status = 'closed'
    ElMessage.success('已截单')
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
</style>
