<template>
  <div class="create-groupbuy">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="22" color="#D4865A"><Plus /></el-icon>
          <span>发起社区接龙</span>
        </div>
      </template>

      <el-form :model="formData" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="接龙标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入接龙标题，如：本周黄油曲奇接龙" />
        </el-form-item>

        <el-form-item label="选择食谱" prop="recipeId">
          <el-select v-model="formData.recipeId" placeholder="请选择食谱" style="width: 100%" @change="handleRecipeChange">
            <el-option
              v-for="recipe in recipes"
              :key="recipe.id"
              :label="recipe.name"
              :value="recipe.id"
            >
              <div style="display: flex; align-items: center; gap: 10px">
                <el-image :src="recipe.imageUrl" style="width: 36px; height: 36px; border-radius: 6px" fit="cover" />
                <span>{{ recipe.name }}</span>
                <span style="color: #999; font-size: 12px">成本¥{{ recipe.cost }} · {{ recipe.duration }}分钟</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="单价(元)" prop="unitPrice">
              <el-input-number v-model="formData.unitPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量上限" prop="maxQuantity">
              <el-input-number v-model="formData.maxQuantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="取货时间" prop="pickupTime">
              <el-date-picker
                v-model="formData.pickupTime"
                type="datetime"
                placeholder="选择取货时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="支付方式" prop="paymentMethod">
          <el-radio-group v-model="formData.paymentMethod">
            <el-radio value="wechat">
              <el-icon><ChatDotRound /></el-icon>
              微信支付
            </el-radio>
            <el-radio value="alipay">
              <el-icon><Wallet /></el-icon>
              支付宝
            </el-radio>
            <el-radio value="cash">
              <el-icon><Money /></el-icon>
              现金
            </el-radio>
            <el-radio value="bank_transfer">
              <el-icon><CreditCard /></el-icon>
              银行转账
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="selectedRecipe">
          <template #label>
            <span style="color: #8B5A3C">食谱预览</span>
          </template>
          <div class="recipe-preview">
            <el-image :src="selectedRecipe.imageUrl" fit="cover" class="preview-img" />
            <div class="preview-info">
              <h4>{{ selectedRecipe.name }}</h4>
              <p>{{ selectedRecipe.description }}</p>
              <div class="preview-meta">
                <el-tag size="small" type="warning" effect="light">成本 ¥{{ selectedRecipe.cost }}</el-tag>
                <el-tag size="small" type="success" effect="light">{{ selectedRecipe.duration }} 分钟</el-tag>
                <el-tag size="small" type="info" effect="light">保存 {{ selectedRecipe.shelfLife }}</el-tag>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="handleSubmit">
            <el-icon><Check /></el-icon>
            发布接龙
          </el-button>
          <el-button size="large" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#D4865A"><List /></el-icon>
          <span>进行中的接龙</span>
          <el-tag type="success" effect="light" size="small">{{ activeGroupBuys.length }} 个进行中</el-tag>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col
          v-for="gb in activeGroupBuys"
          :key="gb.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          style="margin-bottom: 16px"
        >
          <GroupBuyCard :group-buy="gb" @order="handleOrder" @close="handleClose" />
        </el-col>
      </el-row>
      <el-empty v-if="activeGroupBuys.length === 0" description="暂无进行中的接龙" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import GroupBuyCard from '@/components/GroupBuyCard.vue'
import { getRecipes, type Recipe } from '@/api/recipes'
import { getGroupBuys, createGroupBuy, closeGroupBuy, type CreateGroupBuyDto } from '@/api/groupBuys'
import type { GroupBuy } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const recipes = ref<Recipe[]>([])
const groupBuys = ref<GroupBuy[]>([])

const formData = ref<CreateGroupBuyDto & { recipeId: number | null }>({
  recipeId: null,
  title: '',
  maxQuantity: 20,
  pickupTime: '',
  paymentMethod: 'wechat',
  unitPrice: 0
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入接龙标题', trigger: 'blur' }],
  recipeId: [{ required: true, message: '请选择食谱', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  maxQuantity: [{ required: true, message: '请输入数量上限', trigger: 'blur' }],
  pickupTime: [{ required: true, message: '请选择取货时间', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

const selectedRecipe = computed(() => {
  if (!formData.value.recipeId) return undefined
  return recipes.value.find(r => r.id === formData.value.recipeId)
})

const activeGroupBuys = computed(() => {
  return groupBuys.value.filter(g => g.status === 'active')
})

const mockRecipes: Recipe[] = [
  {
    id: 1, name: '经典黄油曲奇', description: '入口即化的黄油曲奇',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    ingredients: [], steps: [], cost: 25, duration: 60, shelfLife: '7天',
    createdAt: '', updatedAt: ''
  },
  {
    id: 2, name: '软心巧克力蛋糕', description: '外酥内软的巧克力熔岩蛋糕',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    ingredients: [], steps: [], cost: 35, duration: 45, shelfLife: '当天',
    createdAt: '', updatedAt: ''
  },
  {
    id: 3, name: '日式抹茶红豆包', description: '松软的抹茶面包裹红豆馅',
    imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400',
    ingredients: [], steps: [], cost: 20, duration: 180, shelfLife: '3天',
    createdAt: '', updatedAt: ''
  }
]

const mockGroupBuys: GroupBuy[] = [
  {
    id: 1, recipeId: 1, title: '本周六黄油曲奇接龙',
    recipe: mockRecipes[0], maxQuantity: 30, currentQuantity: 18,
    pickupTime: '2024-12-28T15:00:00', paymentMethod: 'wechat',
    status: 'active', unitPrice: 38,
    createdAt: '2024-12-20T10:00:00', updatedAt: '2024-12-20T10:00:00'
  },
  {
    id: 2, recipeId: 2, title: '圣诞限定巧克力蛋糕',
    recipe: mockRecipes[1], maxQuantity: 20, currentQuantity: 20,
    pickupTime: '2024-12-25T10:00:00', paymentMethod: 'alipay',
    status: 'active', unitPrice: 58,
    createdAt: '2024-12-18T10:00:00', updatedAt: '2024-12-18T10:00:00'
  }
]

const fetchData = async () => {
  try {
    const r = await getRecipes()
    recipes.value = r.length ? r : mockRecipes
  } catch {
    recipes.value = mockRecipes
  }
  try {
    const g = await getGroupBuys()
    groupBuys.value = g.length ? g : mockGroupBuys
  } catch {
    groupBuys.value = mockGroupBuys
  }
}

const handleRecipeChange = (id: number | null) => {
  if (!id) return
  const recipe = recipes.value.find(r => r.id === id)
  if (recipe && !formData.value.title) {
    formData.value.title = `${recipe.name}接龙`
  }
  if (recipe && !formData.value.unitPrice) {
    formData.value.unitPrice = Math.round(recipe.cost * 1.5)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const payload: CreateGroupBuyDto = {
        recipeId: formData.value.recipeId as number,
        title: formData.value.title,
        maxQuantity: formData.value.maxQuantity,
        pickupTime: formData.value.pickupTime,
        paymentMethod: formData.value.paymentMethod,
        unitPrice: formData.value.unitPrice
      }
      try {
        await createGroupBuy(payload)
        ElMessage.success('接龙发布成功')
        router.push('/orders')
      } catch {
        const newGb: GroupBuy = {
          id: Date.now(),
          ...payload,
          currentQuantity: 0,
          status: 'active',
          recipe: selectedRecipe.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        groupBuys.value.unshift(newGb)
        ElMessage.success('接龙发布成功')
      }
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}

const handleOrder = (gb: GroupBuy) => {
  router.push('/orders')
}

const handleClose = async (gb: GroupBuy) => {
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
.create-groupbuy {
  padding: 0;
}

.form-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #5D3A2A;
}

.card-header .el-tag {
  margin-left: 10px;
}

.list-card {
  border-radius: 12px;
  border: 1px solid #F0E0D0;
}

.recipe-preview {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: #FFF8F0;
  border-radius: 10px;
  border: 1px solid #F5E6D3;
  width: 100%;
}

.preview-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
}

.preview-info h4 {
  margin: 0 0 6px;
  color: #5D3A2A;
  font-size: 15px;
}

.preview-info p {
  margin: 0 0 10px;
  color: #8B5A3C;
  font-size: 13px;
  line-height: 1.5;
}

.preview-meta {
  display: flex;
  gap: 8px;
}
</style>
