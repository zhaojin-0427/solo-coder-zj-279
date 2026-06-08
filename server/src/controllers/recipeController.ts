import { Request, Response } from 'express'
import { Database, Recipe, CreateRecipeDto } from '../types'

export const createRecipeController = (db: Database) => {
  const getAllRecipes = (_req: Request, res: Response) => {
    res.json(db.recipes)
  }

  const getRecipeById = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const recipe = db.recipes.find(r => r.id === id)
    if (!recipe) {
      return res.status(404).json({ message: '食谱不存在' })
    }
    res.json(recipe)
  }

  const createRecipe = (req: Request, res: Response) => {
    const dto: CreateRecipeDto = req.body
    const now = new Date().toISOString()
    const newRecipe: Recipe = {
      id: db.recipes.length > 0 ? Math.max(...db.recipes.map(r => r.id)) + 1 : 1,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400',
      ingredients: dto.ingredients || [],
      steps: dto.steps || [],
      cost: dto.cost,
      duration: dto.duration,
      shelfLife: dto.shelfLife,
      createdAt: now,
      updatedAt: now
    }
    db.recipes.push(newRecipe)
    res.status(201).json(newRecipe)
  }

  const deleteRecipe = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const index = db.recipes.findIndex(r => r.id === id)
    if (index === -1) {
      return res.status(404).json({ message: '食谱不存在' })
    }
    db.recipes.splice(index, 1)
    res.json({ message: '删除成功' })
  }

  return {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    deleteRecipe
  }
}
