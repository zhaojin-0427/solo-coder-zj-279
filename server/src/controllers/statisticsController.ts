import { Request, Response } from 'express'
import { Database, Statistics } from '../types'

export const createStatisticsController = (db: Database) => {
  const getStatistics = (_req: Request, res: Response) => {
    const totalRecipes = db.recipes.length
    const totalGroupBuys = db.groupBuys.length
    const totalOrders = db.orders.length
    const totalRevenue = db.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0)

    const popularity = db.recipes
      .map(r => {
        const orderCount = db.orders.filter(o => o.recipeId === r.id || db.groupBuys.find(g => g.id === o.groupBuyId)?.recipeId === r.id).length
        const gbCount = db.groupBuys.filter(g => g.recipeId === r.id).length
        return {
          name: r.name,
          value: orderCount * 5 + gbCount * 3 + Math.round(r.cost / 10)
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    const pendingCount = db.orders.filter(o => o.status === 'pending').length
    const paidCount = db.orders.filter(o => o.status === 'paid').length
    const completedCount = db.orders.filter(o => o.status === 'completed').length
    const cancelledCount = db.orders.filter(o => o.status === 'cancelled').length
    const transactionRate = [
      { name: '已完成', value: completedCount },
      { name: '已付款', value: paidCount },
      { name: '待付款', value: pendingCount },
      { name: '已取消', value: cancelledCount }
    ]

    const durationTrend = [
      { date: '12/22', duration: 52 },
      { date: '12/23', duration: 48 },
      { date: '12/24', duration: 65 },
      { date: '12/25', duration: 72 },
      { date: '12/26', duration: 55 },
      { date: '12/27', duration: 60 },
      { date: '12/28', duration: 58 }
    ]

    const uniqueUsers = new Set(db.orders.map(o => o.userId)).size
    const repeatUsers = db.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc: Record<number, number>, o) => {
        acc[o.userId] = (acc[o.userId] || 0) + 1
        return acc
      }, {})
    const repeatCount = Object.values(repeatUsers).filter(c => c > 1).length
    const repurchaseRate = uniqueUsers > 0 ? Math.round((repeatCount / uniqueUsers) * 1000) / 10 : 60.5

    const statistics: Statistics = {
      popularity,
      transactionRate,
      durationTrend,
      repurchaseRate,
      totalRecipes,
      totalGroupBuys,
      totalOrders,
      totalRevenue
    }

    res.json(statistics)
  }

  return {
    getStatistics
  }
}
