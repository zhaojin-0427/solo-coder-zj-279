import { Request, Response } from 'express'
import { Database, Review, CreateReviewDto, Order, GroupBuy } from '../types'

const parseShelfLifeDays = (shelfLife: string): number => {
  if (!shelfLife) return 3
  if (shelfLife.includes('当天')) return 0
  const match = shelfLife.match(/(\d+)/)
  return match ? parseInt(match[1]) : 3
}

export const createReviewController = (db: Database) => {
  const populateOrderWithGroupBuy = (order: Order): Order => {
    const groupBuy = db.groupBuys.find(g => g.id === order.groupBuyId)
    let populatedGb: GroupBuy | undefined = groupBuy
    if (groupBuy) {
      const recipe = db.recipes.find(r => r.id === groupBuy.recipeId)
      populatedGb = { ...groupBuy, recipe }
    }
    return { ...order, groupBuy: populatedGb }
  }

  const populateRelations = (review: Review): Review => {
    const order = db.orders.find(o => o.id === review.orderId)
    const populatedOrder = order ? populateOrderWithGroupBuy(order) : undefined
    return { ...review, order: populatedOrder }
  }

  const isOrderEligibleForReview = (order: Order): { eligible: boolean; reason?: string } => {
    if (order.status !== 'completed') {
      return { eligible: false, reason: '只有已完成的订单才能评价' }
    }
    const gb = db.groupBuys.find(g => g.id === order.groupBuyId)
    if (!gb) return { eligible: true }
    const recipe = db.recipes.find(r => r.id === gb.recipeId)
    if (!recipe) return { eligible: true }

    const shelfLifeDays = parseShelfLifeDays(recipe.shelfLife)
    const pickedUpAt = order.pickedUpAt ? new Date(order.pickedUpAt) : new Date(order.updatedAt)
    const now = new Date()
    const diffDays = (now.getTime() - pickedUpAt.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays > shelfLifeDays) {
      return { eligible: false, reason: `已超过保存期限（${recipe.shelfLife}），无法评价` }
    }
    return { eligible: true }
  }

  const getAllReviews = (_req: Request, res: Response) => {
    const result = db.reviews.map(populateRelations)
    res.json(result)
  }

  const getReviewsByUser = (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const result = db.reviews
      .filter(r => r.userId === userId)
      .map(populateRelations)
    res.json(result)
  }

  const getEligibleOrders = (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const reviewedOrderIds = new Set(db.reviews.map(r => r.orderId))
    const eligible = db.orders
      .filter(o => o.userId === userId && !reviewedOrderIds.has(o.id))
      .filter(o => isOrderEligibleForReview(o).eligible)
      .map(populateOrderWithGroupBuy)
    res.json(eligible)
  }

  const checkReviewEligibility = (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const order = db.orders.find(o => o.id === orderId)
    if (!order) {
      return res.status(404).json({ message: '订单不存在' })
    }
    const existing = db.reviews.find(r => r.orderId === orderId)
    if (existing) {
      return res.json({ eligible: false, reason: '该订单已评价' })
    }
    res.json(isOrderEligibleForReview(order))
  }

  const createReview = (req: Request, res: Response) => {
    const dto: CreateReviewDto = req.body
    const order = db.orders.find(o => o.id === dto.orderId)
    if (!order) {
      return res.status(404).json({ message: '订单不存在' })
    }
    const existing = db.reviews.find(r => r.orderId === dto.orderId)
    if (existing) {
      return res.status(400).json({ message: '该订单已评价' })
    }
    const eligibility = isOrderEligibleForReview(order)
    if (!eligibility.eligible) {
      return res.status(400).json({ message: eligibility.reason })
    }
    const now = new Date().toISOString()
    const newReview: Review = {
      id: db.reviews.length > 0 ? Math.max(...db.reviews.map(r => r.id)) + 1 : 1,
      orderId: dto.orderId,
      userId: dto.userId,
      userName: dto.userName,
      rating: dto.rating,
      content: dto.content,
      createdAt: now
    }
    db.reviews.push(newReview)
    res.status(201).json(populateRelations(newReview))
  }

  return {
    getAllReviews,
    getReviewsByUser,
    getEligibleOrders,
    checkReviewEligibility,
    createReview
  }
}
