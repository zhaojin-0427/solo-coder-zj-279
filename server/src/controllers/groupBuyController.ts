import { Request, Response } from 'express'
import { Database, GroupBuy, CreateGroupBuyDto, Order, TimeSlot } from '../types'

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

    const timeSlots: TimeSlot[] = (dto.timeSlots || []).map((ts, idx) => ({
      id: idx + 1,
      time: ts.time,
      capacity: ts.capacity,
      filled: 0
    }))

    const newGb: GroupBuy = {
      id: db.groupBuys.length > 0 ? Math.max(...db.groupBuys.map(g => g.id)) + 1 : 1,
      recipeId: dto.recipeId,
      title: dto.title,
      maxQuantity: dto.maxQuantity,
      currentQuantity: 0,
      waitlistQuantity: 0,
      pickupTime: dto.pickupTime,
      productionDeadline: dto.productionDeadline,
      dailyBatches: dto.dailyBatches,
      allowWaitlist: dto.allowWaitlist,
      timeSlots,
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

    const waitlistOrders = db.orders.filter(
      o => o.groupBuyId === id && o.status === 'waitlisted'
    )
    waitlistOrders.forEach(o => {
      o.status = 'expired'
      o.updatedAt = new Date().toISOString()
    })
    gb.waitlistQuantity = 0

    res.json(populateRecipe(gb))
  }

  const expandCapacity = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const { additionalQuantity } = req.body
    const gb = db.groupBuys.find(g => g.id === id)
    if (!gb) {
      return res.status(404).json({ message: '接龙不存在' })
    }
    if (!additionalQuantity || additionalQuantity <= 0) {
      return res.status(400).json({ message: '扩容数量必须大于0' })
    }

    gb.maxQuantity += additionalQuantity
    gb.updatedAt = new Date().toISOString()

    if (gb.status === 'closed' && gb.currentQuantity < gb.maxQuantity) {
      gb.status = 'active'
    }

    const promoted: Order[] = []
    if (gb.allowWaitlist && gb.waitlistQuantity > 0) {
      const remainingSlots = gb.maxQuantity - gb.currentQuantity
      const waitlistOrders = db.orders
        .filter(o => o.groupBuyId === id && o.status === 'waitlisted')
        .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0))

      let slotsFilled = 0
      for (const order of waitlistOrders) {
        if (slotsFilled >= remainingSlots) break
        if (order.quantity <= remainingSlots - slotsFilled) {
          order.status = 'to_produce'
          order.promotedAt = new Date().toISOString()
          order.updatedAt = new Date().toISOString()
          slotsFilled += order.quantity
          gb.currentQuantity += order.quantity
          gb.waitlistQuantity -= order.quantity
          promoted.push(order)
        }
      }

      db.orders
        .filter(o => o.groupBuyId === id && o.status === 'waitlisted')
        .forEach((o, idx) => {
          o.waitlistPosition = idx + 1
        })
    }

    res.json({
      groupBuy: populateRecipe(gb),
      promotedCount: promoted.length,
      promotedOrders: promoted
    })
  }

  return {
    getAllGroupBuys,
    getGroupBuyById,
    createGroupBuy,
    closeGroupBuy,
    expandCapacity
  }
}
