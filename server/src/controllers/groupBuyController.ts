import { Request, Response } from 'express'
import { Database, GroupBuy, CreateGroupBuyDto } from '../types'

export const createGroupBuyController = (db: Database) => {
  const populateRecipe = (gb: GroupBuy): GroupBuy => {
    const recipe = db.recipes.find(r => r.id === gb.recipeId)
    return { ...gb, recipe }
  }

  const getAllGroupBuys = (_req: Request, res: Response) => {
    const result = db.groupBuys.map(populateRecipe)
    res.json(result)
  }

  const getGroupBuyById = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const gb = db.groupBuys.find(g => g.id === id)
    if (!gb) {
      return res.status(404).json({ message: '接龙不存在' })
    }
    res.json(populateRecipe(gb))
  }

  const createGroupBuy = (req: Request, res: Response) => {
    const dto: CreateGroupBuyDto = req.body
    const recipe = db.recipes.find(r => r.id === dto.recipeId)
    if (!recipe) {
      return res.status(404).json({ message: '食谱不存在' })
    }
    const now = new Date().toISOString()
    const newGb: GroupBuy = {
      id: db.groupBuys.length > 0 ? Math.max(...db.groupBuys.map(g => g.id)) + 1 : 1,
      recipeId: dto.recipeId,
      title: dto.title,
      maxQuantity: dto.maxQuantity,
      currentQuantity: 0,
      pickupTime: dto.pickupTime,
      paymentMethod: dto.paymentMethod,
      status: 'active',
      unitPrice: dto.unitPrice,
      createdAt: now,
      updatedAt: now
    }
    db.groupBuys.push(newGb)
    res.status(201).json(populateRecipe(newGb))
  }

  const closeGroupBuy = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const gb = db.groupBuys.find(g => g.id === id)
    if (!gb) {
      return res.status(404).json({ message: '接龙不存在' })
    }
    gb.status = 'closed'
    gb.updatedAt = new Date().toISOString()
    res.json(populateRecipe(gb))
  }

  return {
    getAllGroupBuys,
    getGroupBuyById,
    createGroupBuy,
    closeGroupBuy
  }
}
