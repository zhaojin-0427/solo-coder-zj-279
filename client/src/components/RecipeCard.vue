<template>
  <el-card class="recipe-card" shadow="hover">
    <div class="card-image">
      <el-image :src="recipe.imageUrl" fit="cover" style="width: 100%; height: 100%" />
      <div class="cost-tag">
        <el-icon><Coin /></el-icon>
        成本 ¥{{ recipe.cost }}
      </div>
    </div>
    <div class="card-content">
      <h3 class="recipe-name">{{ recipe.name }}</h3>
      <p class="recipe-desc">{{ recipe.description }}</p>
      <div class="recipe-meta">
        <div class="meta-item">
          <el-icon color="#D4865A"><Timer /></el-icon>
          <span>{{ recipe.duration }} 分钟</span>
        </div>
        <div class="meta-item">
          <el-icon color="#D4865A"><CollectionTag /></el-icon>
          <span>保存 {{ recipe.shelfLife }}</span>
        </div>
      </div>
      <div class="card-actions">
        <el-button type="primary" @click="$emit('view', recipe)">
          <el-icon><View /></el-icon>
          查看详情
        </el-button>
        <el-button type="danger" plain @click="$emit('delete', recipe)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { Recipe } from '@/types'

defineProps<{
  recipe: Recipe
}>()

defineEmits<{
  (e: 'view', recipe: Recipe): void
  (e: 'delete', recipe: Recipe): void
}>()
</script>

<style scoped>
.recipe-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #F0E0D0;
  transition: all 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(93, 58, 42, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background-color: #F5E6D3;
}

.cost-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(93, 58, 42, 0.85);
  color: #FFD4B8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-content {
  padding: 16px;
}

.recipe-name {
  margin: 0 0 8px 0;
  font-size: 17px;
  color: #5D3A2A;
  font-weight: 600;
}

.recipe-desc {
  margin: 0 0 14px 0;
  font-size: 13px;
  color: #8B5A3C;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8B5A3C;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions .el-button {
  flex: 1;
}
</style>
