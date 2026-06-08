import { Request, Response } from 'express'
import { Database, Order, CreateOrderDto, GroupBuy, Recipe, OrderStatus } from '../types'

const parseShelfLifeDays = (shelfLife: string): number => {
  if (!shelfLife) return 3
  if (shelfLife.includes('当天')) return 0
  const match = shelfLife.match(/(\d+)/)
  return match ? parseInt(match[1]) : 3
}

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

  const promoteWaitlist = (gb: GroupBuy, freedQuantity: number): Order[] => {
    const promoted: Order[] = []
    if (!gb.allowWaitlist || gb.waitlistQuantity <= 0 || freedQuantity <= 0) return promoted

    const waitlistOrders = db.orders
      .filter(o => o.groupBuyId === gb.id && o.status === 'waitlisted')
      .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0))

    let slotsToFill = freedQuantity
    for (const order of waitlistOrders) {
      if (slotsToFill <= 0) break
      if (order.quantity <= slotsToFill) {
        order.status = 'to_produce'
        order.promotedAt = new Date().toISOString()
        order.updatedAt = new Date().toISOString()
        slotsToFill -= order.quantity
        gb.currentQuantity += order.quantity
        gb.waitlistQuantity -= order.quantity
        promoted.push(order)
      }
    }

    db.orders
      .filter(o => o.groupBuyId === gb.id && o.status === 'waitlisted')
      .forEach((o, idx) => {
        o.waitlistPosition = idx + 1
      })

    if (gb.status === 'closed' && gb.currentQuantity < gb.maxQuantity) {
      gb.status = 'active'
    }

    return promoted
  }

  const determineOrderStatus = (gb: GroupBuy, recipe: Recipe, quantity: number): {
    status: OrderStatus
    message: string
    canPlace: boolean
  } => {
    const now = new Date()
    const deadline = new Date(gb.productionDeadline)
    const pickup = new Date(gb.pickupTime)

    if (now > deadline) {
      return { status: 'expired', message: '已过制作截止时间，无法下单', canPlace: false }
    }

    const durationMinutes = recipe.duration || 60
    const productionReady = new Date(now.getTime() + durationMinutes * 60 * 1000)
    if (productionReady > pickup) {
      return { status: 'expired', message: `制作需要${durationMinutes}分钟，当前下单已来不及在取货时间完成`, canPlace: false }
    }

    const remaining = gb.maxQuantity - gb.currentQuantity

    if (quantity <= remaining) {
      return { status: 'to_produce', message: '正式名额可用', canPlace: true }
    }

    if (gb.allowWaitlist) {
      return { status: 'waitlisted', message: `正式名额已满，已进入候补队列（当前候补${gb.waitlistQuantity}份）`, canPlace: true }
    }

    return { status: 'expired', message: '正式名额已满且不接受候补', canPlace: false }
  }

  const getAllOrders = (_req: Request, res: Response) => {
    const result = db.orders.map(populateRelations)
    res.json(result)
  }

  const getOrdersByGroupBuy = (req: Request, res: Response) => {
    const groupBuyId = parseInt(req.params.groupBuyId)
    const result = db.orders
      .filter(o => o.groupBuyId === groupBuyId)
      .map(populateRelations)
    res.json(result)
  }

  const checkOrderEligibility = (req: Request, res: Response) => {
    const { groupBuyId, quantity } = req.query
    const gb = db.groupBuys.find(g => g.id === parseInt(groupBuyId as string))
    if (!gb) {
      return res.status(404).json({ message: '接龙不存在' })
    }
    if (gb.status !== 'active') {
      return res.json({ status: 'expired' as OrderStatus, message: '接龙已结束', canPlace: false })
    }
    const recipe = db.recipes.find(r => r.id === gb.recipeId)
    if (!recipe) {
      return res.status(404).json({ message: '食谱不存在' })
    }
    const result = determineOrderStatus(gb, recipe, parseInt(quantity as string) || 1)
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
    const recipe = db.recipes.find(r => r.id === gb.recipeId)
    if (!recipe) {
      return res.status(404).json({ message: '食谱不存在' })
    }

    const eligibility = determineOrderStatus(gb, recipe, dto.quantity)
    if (!eligibility.canPlace) {
      return res.status(400).json({ message: eligibility.message })
    }

    const now = new Date().toISOString()
    const orderStatus: OrderStatus = eligibility.status

    let waitlistPosition: number | undefined
    if (orderStatus === 'waitlisted') {
      waitlistPosition = Math.floor(gb.waitlistQuantity / dto.quantity) + 1
      gb.waitlistQuantity += dto.quantity
    } else {
      gb.currentQuantity += dto.quantity

      if (dto.timeSlotId) {
        const ts = gb.timeSlots.find(t => t.id === dto.timeSlotId)
        if (ts && ts.filled + dto.quantity <= ts.capacity) {
          ts.filled += dto.quantity
        }
      }
    }

    if (gb.currentQuantity >= gb.maxQuantity && gb.waitlistQuantity >= 0) {
      if (!gb.allowWaitlist || gb.waitlistQuantity === 0) {
        if (gb.currentQuantity >= gb.maxQuantity) {
          gb.status = 'closed'
        }
      }
    }

    gb.updatedAt = now

    const newOrder: Order = {
      id: db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1001,
      groupBuyId: dto.groupBuyId,
      userId: 1,
      userName: dto.userName,
      phone: dto.phone,
      quantity: dto.quantity,
      totalAmount: dto.quantity * gb.unitPrice,
      status: orderStatus,
      waitlistPosition,
      timeSlotId: dto.timeSlotId,
      createdAt: now,
      updatedAt: now
    }
    db.orders.push(newOrder)

    res.status(201).json({
      order: populateRelations(newOrder),
      statusMessage: eligibility.message
    })
  }

  const updateOrderStatus = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const { status } = req.body
    const order = db.orders.find(o => o.id === id)
    if (!order) {
      return res.status(404).json({ message: '订单不存在' })
    }
    const validStatuses: OrderStatus[] = [
      'pending_payment', 'waitlisted', 'to_produce',
      'pending_pickup', 'completed', 'cancelled', 'expired'
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的状态值' })
    }

    const oldStatus = order.status
    order.status = status as OrderStatus
    order.updatedAt = new Date().toISOString()

    if (status === 'completed') {
      order.pickedUpAt = new Date().toISOString()
    }

    let promoted: Order[] = []
    if ((oldStatus === 'to_produce' || oldStatus === 'pending_pickup' || oldStatus === 'pending_payment')
        && (status === 'cancelled' || status === 'expired')) {
      const gb = db.groupBuys.find(g => g.id === order.groupBuyId)
      if (gb) {
        gb.currentQuantity = Math.max(0, gb.currentQuantity - order.quantity)

        if (order.timeSlotId) {
          const ts = gb.timeSlots.find(t => t.id === order.timeSlotId)
          if (ts) ts.filled = Math.max(0, ts.filled - order.quantity)
        }

        promoted = promoteWaitlist(gb, order.quantity)
        gb.updatedAt = new Date().toISOString()
      }
    }

    res.json({
      order: populateRelations(order),
      promotedCount: promoted.length,
      promotedOrders: promoted
    })
  }

  const deleteOrder = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const index = db.orders.findIndex(o => o.id === id)
    if (index === -1) {
      return res.status(404).json({ message: '订单不存在' })
    }
    const order = db.orders[index]
    const gb = db.groupBuys.find(g => g.id === order.groupBuyId)

    let promoted: Order[] = []
    if (gb) {
      if (order.status === 'waitlisted') {
        gb.waitlistQuantity = Math.max(0, gb.waitlistQuantity - order.quantity)
        db.orders
          .filter(o => o.groupBuyId === gb.id && o.status === 'waitlisted')
          .forEach((o, idx) => {
            o.waitlistPosition = idx + 1
          })
      } else if (order.status !== 'completed' && order.status !== 'expired' && order.status !== 'cancelled') {
        gb.currentQuantity = Math.max(0, gb.currentQuantity - order.quantity)
        if (order.timeSlotId) {
          const ts = gb.timeSlots.find(t => t.id === order.timeSlotId)
          if (ts) ts.filled = Math.max(0, ts.filled - order.quantity)
        }
        promoted = promoteWaitlist(gb, order.quantity)
      }
      gb.updatedAt = new Date().toISOString()
    }

    db.orders.splice(index, 1)
    res.json({ message: '删除成功', promotedCount: promoted.length, promotedOrders: promoted })
  }

  const markReadyForPickup = (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const order = db.orders.find(o => o.id === id)
    if (!order) {
      return res.status(404).json({ message: '订单不存在' })
    }
    if (order.status !== 'to_produce') {
      return res.status(400).json({ message: '只有待生产状态的订单可以标记为待取货' })
    }
    order.status = 'pending_pickup'
    order.updatedAt = new Date().toISOString()
    res.json(populateRelations(order))
  }

  return {
    getAllOrders,
    getOrdersByGroupBuy,
    checkOrderEligibility,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    markReadyForPickup
  }
}
