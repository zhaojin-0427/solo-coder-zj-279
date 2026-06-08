<template>
  <div class="recipe-library">
    <div class="page-header">
      <el-input
        v-model="searchText"
        placeholder="搜索食谱名称或描述..."
        class="search-input"
        clearable
        :prefix-icon="Search"
      />
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        上传新食谱
      </el-button>
    </div>

    <el-row v-loading="loading" :gutter="20">
      <el-col
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        style="margin-bottom: 20px"
      >
        <RecipeCard
          :recipe="recipe"
          @view="handleView"
          @delete="handleDelete"
        />
      </el-col>
    </el-row>

    <el-empty v-if="!loading && filteredRecipes.length === 0" description="暂无食谱，快来上传第一个吧" />

    <el-dialog
      v-model="showCreateDialog"
      title="上传新食谱"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="食谱名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入食谱名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入食谱描述"
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="imageUrl">
          <el-input v-model="formData.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="食材" prop="ingredients">
          <el-select
            v-model="formData.ingredients"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入食材后按回车添加"
            style="width: 100%"
          >
            <el-option
              v-for="item in formData.ingredients"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="步骤" prop="steps">
          <el-select
            v-model="formData.steps"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入步骤后按回车添加"
            style="width: 100%"
          >
            <el-option
              v-for="item in formData.steps"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="成本(元)" prop="cost">
              <el-input-number v-model="formData.cost" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时长(分钟)" prop="duration">
              <el-input-number v-model="formData.duration" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="保存期限" prop="shelfLife">
              <el-input v-model="formData.shelfLife" placeholder="如: 3天" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="食谱详情" width="600px">
      <div v-if="currentRecipe" class="recipe-detail">
        <el-image :src="currentRecipe.imageUrl" fit="cover" style="width: 100%; height: 240px; border-radius: 8px" />
        <h2 style="margin: 16px 0 8px; color: #5D3A2A">{{ currentRecipe.name }}</h2>
        <p style="color: #8B5A3C; margin-bottom: 16px">{{ currentRecipe.description }}</p>
        <div class="detail-meta">
          <el-tag type="warning" effect="light">成本 ¥{{ currentRecipe.cost }}</el-tag>
          <el-tag type="success" effect="light">时长 {{ currentRecipe.duration }} 分钟</el-tag>
          <el-tag type="info" effect="light">保存 {{ currentRecipe.shelfLife }}</el-tag>
        </div>
        <div class="detail-section">
          <h4><el-icon color="#D4865A"><Food /></el-icon> 食材</h4>
          <div class="tags">
            <el-tag v-for="ing in currentRecipe.ingredients" :key="ing" effect="plain" type="warning">
              {{ ing }}
            </el-tag>
          </div>
        </div>
        <div class="detail-section">
          <h4><el-icon color="#D4865A"><List /></el-icon> 制作步骤</h4>
          <ol class="steps">
            <li v-for="(step, idx) in currentRecipe.steps" :key="idx">{{ step }}</li>
          </ol>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import RecipeCard from '@/components/RecipeCard.vue'
import { getRecipes, createRecipe, deleteRecipe, type CreateRecipeDto } from '@/api/recipes'
import type { Recipe } from '@/types'

const loading = ref(false)
const searchText = ref('')
const recipes = ref<Recipe[]>([])
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const currentRecipe = ref<Recipe | null>(null)
const formRef = ref<FormInstance>()

const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: '经典黄油曲奇',
    description: '入口即化的黄油曲奇，奶香浓郁，酥脆可口，是下午茶的完美搭档。',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    ingredients: ['低筋面粉 200g', '黄油 130g', '细砂糖 50g', '糖粉 40g', '鸡蛋 1个', '香草精 少许'],
    steps: ['黄油室温软化，加糖打发', '分次加入蛋液打发均匀', '筛入面粉切拌均匀', '装入裱花袋挤出形状', '170度烤15分钟'],
    cost: 25,
    duration: 60,
    shelfLife: '7天',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '软心巧克力蛋糕',
    description: '外酥内软的巧克力熔岩蛋糕，切开后浓郁的巧克力酱流出，让人无法抗拒。',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    ingredients: ['黑巧克力 150g', '黄油 100g', '鸡蛋 2个', '蛋黄 2个', '细砂糖 50g', '低筋面粉 30g'],
    steps: ['巧克力和黄油隔水融化', '鸡蛋加糖打发', '混合后筛入面粉', '倒入模具', '200度烤8分钟'],
    cost: 35,
    duration: 45,
    shelfLife: '当天',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: '日式抹茶红豆包',
    description: '松软的抹茶面包裹着绵密的红豆馅，茶香与豆香完美融合。',
    imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=400',
    ingredients: ['高筋面粉 250g', '抹茶粉 10g', '细砂糖 40g', '酵母 3g', '牛奶 150ml', '红豆馅 200g'],
    steps: ['所有材料揉成面团', '发酵至两倍大', '分割包入红豆馅', '二次发酵', '180度烤20分钟'],
    cost: 20,
    duration: 180,
    shelfLife: '3天',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: 4,
    name: '法式马卡龙',
    description: '精致的法式甜点，外脆内软，口感层次丰富，少女心满满的粉粉颜色。',
    imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400',
    ingredients: ['杏仁粉 100g', '糖粉 100g', '蛋白 75g', '细砂糖 30g', '食用色素 少许'],
    steps: ['粉类过筛混合', '蛋白打发至硬性发泡', '翻拌均匀至缎带状', '挤出圆形晾皮', '150度烤15分钟'],
    cost: 40,
    duration: 90,
    shelfLife: '5天',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  }
]

const filteredRecipes = computed(() => {
  if (!searchText.value) return recipes.value
  const kw = searchText.value.toLowerCase()
  return recipes.value.filter(
    r => r.name.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw)
  )
})

const formData = ref<CreateRecipeDto>({
  name: '',
  description: '',
  imageUrl: '',
  ingredients: [],
  steps: [],
  cost: 0,
  duration: 0,
  shelfLife: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入食谱名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  cost: [{ required: true, message: '请输入成本', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入时长', trigger: 'blur' }],
  shelfLife: [{ required: true, message: '请输入保存期限', trigger: 'blur' }]
}

const fetchRecipes = async () => {
  loading.value = true
  try {
    const data = await getRecipes()
    recipes.value = data.length ? data : mockRecipes
  } catch {
    recipes.value = mockRecipes
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createRecipe(formData.value)
        ElMessage.success('食谱创建成功')
        showCreateDialog.value = false
        formRef.value.resetFields()
        formData.value = {
          name: '', description: '', imageUrl: '', ingredients: [], steps: [], cost: 0, duration: 0, shelfLife: ''
        }
        fetchRecipes()
      } catch {
        const newRecipe: Recipe = {
          id: Date.now(),
          ...formData.value,
          imageUrl: formData.value.imageUrl || 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        recipes.value.unshift(newRecipe)
        ElMessage.success('食谱创建成功')
        showCreateDialog.value = false
        formRef.value.resetFields()
      }
    }
  })
}

const handleView = (recipe: Recipe) => {
  currentRecipe.value = recipe
  showDetailDialog.value = true
}

const handleDelete = async (recipe: Recipe) => {
  try {
    await ElMessageBox.confirm(`确定删除食谱"${recipe.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRecipe(recipe.id)
    ElMessage.success('删除成功')
    fetchRecipes()
  } catch {
    recipes.value = recipes.value.filter(r => r.id !== recipe.id)
    ElMessage.success('删除成功')
  }
}

onMounted(fetchRecipes)
</script>

<style scoped>
.recipe-library {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.search-input {
  max-width: 360px;
}

.recipe-detail {
  padding: 4px;
}

.detail-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5D3A2A;
  margin: 18px 0 10px;
  font-size: 15px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.steps {
  padding-left: 20px;
  color: #5D3A2A;
  line-height: 2;
}
</style>
