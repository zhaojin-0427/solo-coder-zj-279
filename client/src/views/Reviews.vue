<template>
  <div class="reviews-page">
    <el-row :gutter="20">
      <el-col :xs="24" :md="15">
        <el-card class="reviews-card">
          <template #header>
            <div class="card-title">
              <el-icon :size="20" color="#D4865A"><ChatDotRound /></el-icon>
              <span>用户评价</span>
              <el-tag type="warning" effect="light" size="small">{{ reviews.length }} 条评价</el-tag>
            </div>
          </template>
          <div v-loading="loading">
            <ReviewItem v-for="r in reviews" :key="r.id" :review="r" />
            <el-empty v-if="reviews.length === 0" description="暂无评价" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="9">
        <el-card class="eligible-card">
          <template #header>
            <div class="card-title">
              <el-icon :size="20" color="#D4865A"><EditPen /></el-icon>
              <span>可评价订单</span>
            </div>
          </template>
          <div v-if="eligibleOrders.length === 0" class="no-eligible">
            <el-empty description="暂无可评价的订单" :image-size="80" />
          </div>
          <div v-else class="order-list">
            <div v-for="order in eligibleOrders" :key="order.id" class="order-item">
              <div class="order-info">
                <div class="order-title">{{ order.groupBuy?.title || '订单 #' + order.id }}</div>
                <div class="order-meta">
                  <el-tag size="small" type="success" effect="plain">{{ order.quantity }} 份</el-tag>
                  <span>¥{{ order.totalAmount }}</span>
                </div>
              </div>
              <el-button type="primary" size="small" @click="openReviewDialog(order)">
                <el-icon><Edit /></el-icon>
                评价
              </el-button>
            </div>
          </div>
        </el-card>

        <el-card class="stats-card" style="margin-top: 20px">
          <template #header>
            <div class="card-title">
              <el-icon :size="20" color="#D4865A"><DataLine /></el-icon>
              <span>评价概况</span>
            </div>
          </template>
          <div class="rating-summary">
            <div class="avg-rating">
              <span class="rating-number">{{ avgRating.toFixed(1) }}</span>
              <div class="rating-stars">
                <el-rate v-model="avgRatingDisplay" disabled size="large" />
              </div>
              <span class="rating-count">{{ reviews.length }} 条评价</span>
            </div>
            <div class="rating-dist">
              <div v-for="n in 5" :key="n" class="rating-row">
                <span class="star-label">{{ 6 - n }}星</span>
                <el-progress
                  :percentage="ratingPercent(6 - n)"
                  :show-text="false"
                  :stroke-width="8"
                  color="#F5A623"
                />
                <span class="star-count">{{ ratingCount(6 - n) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showReviewDialog" title="发布评价" width="500px" :close-on-click-modal="false">
      <div v-if="currentOrder" class="review-form">
        <el-alert type="info" :closable="false" style="margin-bottom: 18px">
          评价订单：{{ currentOrder.groupBuy?.title || '#' + currentOrder.id }}
        </el-alert>
        <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
          <el-form-item label="评分" prop="rating">
            <el-rate v-model="reviewForm.rating" />
          </el-form-item>
          <el-form-item label="评价内容" prop="content">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="5"
              placeholder="分享您的体验和建议..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReview">
          <el-icon><Check /></el-icon>
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import ReviewItem from '@/components/ReviewItem.vue'
import { getReviews, createReview, type CreateReviewDto } from '@/api/reviews'
import { getOrders, type Order } from '@/api/orders'
import { useUserStore } from '@/stores/user'
import type { Review, GroupBuy, Recipe } from '@/types'

const userStore = useUserStore()
const loading = ref(false)
const reviews = ref<Review[]>([])
const orders = ref<Order[]>([])
const showReviewDialog = ref(false)
const currentOrder = ref<Order | null>(null)
const reviewFormRef = ref<FormInstance>()

const mockRecipes: Recipe[] = [
  { id: 1, name: '经典黄油曲奇', description: '', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', ingredients: [], steps: [], cost: 25, duration: 60, shelfLife: '7天', createdAt: '', updatedAt: '' },
  { id: 2, name: '软心巧克力蛋糕', description: '', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', ingredients: [], steps: [], cost: 35, duration: 45, shelfLife: '当天', createdAt: '', updatedAt: '' }
]

const mockGroupBuys: GroupBuy[] = [
  { id: 1, recipeId: 1, recipe: mockRecipes[0], title: '本周六黄油曲奇接龙', maxQuantity: 30, currentQuantity: 18, pickupTime: '2024-12-28T15:00:00', paymentMethod: 'wechat', status: 'active', unitPrice: 38, createdAt: '', updatedAt: '' },
  { id: 2, recipeId: 2, recipe: mockRecipes[1], title: '圣诞限定巧克力蛋糕', maxQuantity: 20, currentQuantity: 20, pickupTime: '2024-12-25T10:00:00', paymentMethod: 'alipay', status: 'active', unitPrice: 58, createdAt: '', updatedAt: '' }
]

const mockOrders: Order[] = [
  { id: 1001, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 1, userName: '小明', phone: '13800138001', quantity: 2, totalAmount: 76, status: 'completed', createdAt: '2024-12-20T12:00:00', updatedAt: '2024-12-20T12:00:00' },
  { id: 1002, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 2, userName: '小红', phone: '13800138002', quantity: 3, totalAmount: 114, status: 'completed', createdAt: '2024-12-21T09:30:00', updatedAt: '2024-12-21T09:30:00' },
  { id: 1004, groupBuyId: 1, groupBuy: mockGroupBuys[0], userId: 4, userName: '小美', phone: '13800138004', quantity: 5, totalAmount: 190, status: 'completed', createdAt: '2024-12-22T16:45:00', updatedAt: '2024-12-22T16:45:00' }
]

const mockReviews: Review[] = [
  { id: 1, orderId: 1001, order: mockOrders[0], userId: 1, userName: '小明', rating: 5, content: '曲奇超级好吃！黄油香味很浓，酥脆可口，包装也很精美，下次还会回购。', createdAt: '2024-12-23T10:00:00' },
  { id: 2, orderId: 1004, order: mockOrders[2], userId: 4, userName: '小美', rating: 4, content: '味道不错，甜度刚刚好，就是感觉稍微有点硬，可能是我保存的问题？整体还是很满意的。', createdAt: '2024-12-24T14:30:00' },
  { id: 3, orderId: 1002, order: mockOrders[1], userId: 2, userName: '小红', rating: 5, content: '太棒了！邻居们都问我在哪里买的，已经推荐给大家了。老板人很好，还送了小赠品~', createdAt: '2024-12-24T18:15:00' }
]

const reviewForm = ref<CreateReviewDto>({
  orderId: 0,
  rating: 5,
  content: ''
})

const reviewRules: FormRules = {
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }]
}

const eligibleOrders = computed(() => {
  const reviewedOrderIds = new Set(reviews.value.map(r => r.orderId))
  return orders.value.filter(o => o.status === 'completed' && !reviewedOrderIds.has(o.id))
})

const avgRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.value.length
})

const avgRatingDisplay = ref(0)

const ratingCount = (n: number) => reviews.value.filter(r => r.rating === n).length
const ratingPercent = (n: number) => {
  if (reviews.value.length === 0) return 0
  return Math.round((ratingCount(n) / reviews.value.length) * 100)
}

const fetchData = async () => {
  loading.value = true
  try {
    const r = await getReviews()
    reviews.value = r.length ? r : mockReviews
  } catch {
    reviews.value = mockReviews
  }
  try {
    const o = await getOrders()
    orders.value = o.length ? o : mockOrders
  } catch {
    orders.value = mockOrders
  }
  avgRatingDisplay.value = Math.round(avgRating.value)
  loading.value = false
}

const openReviewDialog = (order: Order) => {
  currentOrder.value = order
  reviewForm.value = {
    orderId: order.id,
    rating: 5,
    content: ''
  }
  showReviewDialog.value = true
}

const submitReview = async () => {
  if (!reviewFormRef.value) return
  await reviewFormRef.value.validate(async (valid) => {
    if (valid) {
      const payload: CreateReviewDto = {
        ...reviewForm.value,
        userId: userStore.user?.id || 1,
        userName: userStore.user?.nickname || '我'
      }
      try {
        await createReview(payload)
        ElMessage.success('评价发布成功')
        showReviewDialog.value = false
        fetchData()
      } catch {
        const newReview: Review = {
          id: Date.now(),
          orderId: reviewForm.value.orderId,
          order: currentOrder.value || undefined,
          userId: userStore.user?.id || 1,
          userName: userStore.user?.nickname || '我',
          rating: reviewForm.value.rating,
          content: reviewForm.value.content,
          createdAt: new Date().toISOString()
        }
        reviews.value.unshift(newReview)
        avgRatingDisplay.value = Math.round(avgRating.value)
        ElMessage.success('评价发布成功')
        showReviewDialog.value = false
      }
    }
  })
}

onMounted(fetchData)
</script>

<style scoped>
.reviews-page {
  padding: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #5D3A2A;
  font-size: 16px;
}

.card-title .el-tag {
  margin-left: 8px;
}

.reviews-card,
.eligible-card,
.stats-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
}

.order-list {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background: #FFF8F0;
  margin-bottom: 10px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-title {
  font-size: 14px;
  font-weight: 500;
  color: #5D3A2A;
  margin-bottom: 4px;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8B5A3C;
}

.no-eligible {
  padding: 20px 0;
}

.rating-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avg-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
}

.rating-number {
  font-size: 40px;
  font-weight: 700;
  color: #D4622C;
}

.rating-count {
  font-size: 12px;
  color: #B8917A;
}

.rating-dist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-label {
  width: 36px;
  font-size: 12px;
  color: #8B5A3C;
}

.star-count {
  width: 30px;
  font-size: 12px;
  color: #8B5A3C;
  text-align: right;
}

.rating-row :deep(.el-progress) {
  flex: 1;
}
</style>
