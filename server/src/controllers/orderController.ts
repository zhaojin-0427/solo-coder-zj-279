import { Request, Response } from 'express'
import { Database, Order, CreateOrderDto } from '../types'

export const createOrderController = (db: Database) => {
  const populateRelations = (order: Order): Order => {
    const groupBuy = db.groupBuys.find(g => g.id === order.groupBuyId)
    let populatedGb = groupBuy
    if (groupBuy) {
      const recipe = db.recipes.find(r => r.id === groupBuy.recipeId)
      populatedGb = { ...groupBuy, recipe }
    }
    return { ...order, groupBuy: populatedGb }
  }

  const getAllOrders = (_req: Request, res: Response) => {
    const result = db.orders.map(populateRelations)
    res.json(result)
  }

  const createOrder = (req: Request, res: Response) => {
    const dto: CreateOrderDto = req.body
    const gb = db.groupBuys.find(g => g.id === dto.groupBuyId)
    if (!gb) {
      return res.status(404).json({ message: '接龙不存在' })
    }
    if (gb.status !== 'active') {
      return res.status(400).json({ message: '该接龙已结束' })
    }
    const remaining = gb.maxQuantity - gb.currentQuantity
    if (dto.quantity > remaining) {
      return res.status(400).json({ message: `数量超过剩余名额（剩余${remaining}份）` })
    }

    const now = new Date().toISOString()
    const newOrder: Order = {
      id: db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1001,
      groupBuyId: dto.groupBuyId,
      userId: 1,
      userName: dto.userName,
      phone: dto.phone,
      quantity: dto.quantity,
      totalAmount: dto.quantity * gb.unitPrice,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    }
    db.orders.push(newOrder)

    gb.currentQuantity += dto.quantity
    gb.updatedAt = now
    if (gb.currentQuantity >= gb.maxQuantity) {
      gb.status = 'closed'
    }

    res.status(201).json(populateRelations(newOrder))
  }

  const updateOrderStatus = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const { status } = req.body
    const order = db.orders.find(o => o.id === id)
    if (!order) {
      return res.status(404).json({ message: '订单不存在' })
    }
    if (!['pending', 'paid', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: '无效的状态值' })
    }
    order.status = status as Order['status']
    order.updatedAt = new Date().toISOString()
    res.json(populateRelations(order))
  }

  const deleteOrder = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const index = db.orders.findIndex(o => o.id === id)
    if (index === -1) {
      return res.status(404).json({ message: '订单不存在' })
    }
    const order = db.orders[index]
    const gb = db.groupBuys.find(g => g.id === order.groupBuyId)
    if (gb && gb.status === 'active') {
      gb.currentQuantity = Math.max(0, gb.currentQuantity - order.quantity)
      gb.updatedAt = new Date().toISOString()
    }
    db.orders.splice(index, 1)
    res.json({ message: '删除成功' })
  }

  return {
    getAllOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder
  }
}
