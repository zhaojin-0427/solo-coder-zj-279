import { Request, Response } from 'express'
import { Database, Review, CreateReviewDto, Order, GroupBuy } from '../types'

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
    createReview
  }
}
