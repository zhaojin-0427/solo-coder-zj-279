import request from './index'
import type { Recipe } from '@/types'

export interface CreateRecipeDto {
  name: string
  description: string
  imageUrl: string
  ingredients: string[]
  steps: string[]
  cost: number
  duration: number
  shelfLife: string
}

export const getRecipes = () => {
  return request.get<any, Recipe[]>('/recipes')
}

export const getRecipe = (id: number) => {
  return request.get<any, Recipe>(`/recipes/${id}`)
}

export const createRecipe = (data: CreateRecipeDto) => {
  return request.post<any, Recipe>('/recipes', data)
}

export const updateRecipe = (id: number, data: Partial<CreateRecipeDto>) => {
  return request.put<any, Recipe>(`/recipes/${id}`, data)
}

export const deleteRecipe = (id: number) => {
  return request.delete<any, void>(`/recipes/${id}`)
}
