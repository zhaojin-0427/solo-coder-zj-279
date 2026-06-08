import { Request, Response } from 'express'
import { Database, Statistics } from '../types'

export const createStatisticsController = (db: Database) => {
  const getStatistics = (_req: Request, res: Response) => {
    const totalRecipes = db.recipes.length
    const totalGroupBuys = db.groupBuys.length
    const totalOrders = db.orders.length
    const totalRevenue = db.orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'expired')
      .reduce((sum, o) => sum + o.totalAmount, 0)

    const popularity = db.recipes
      .map(r => {
        const orderCount = db.orders.filter(o => {
          const gb = db.groupBuys.find(g => g.id === o.groupBuyId)
          return gb?.recipeId === r.id && o.status !== 'cancelled' && o.status !== 'expired'
        }).length
        const gbCount = db.groupBuys.filter(g => g.recipeId === r.id).length
        return {
          name: r.name,
          value: orderCount * 5 + gbCount * 3 + Math.round(r.cost / 10)
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    const toProduceCount = db.orders.filter(o => o.status === 'to_produce').length
    const waitlistedCount = db.orders.filter(o => o.status === 'waitlisted').length
    const pendingPickupCount = db.orders.filter(o => o.status === 'pending_pickup').length
    const completedCount = db.orders.filter(o => o.status === 'completed').length
    const cancelledCount = db.orders.filter(o => o.status === 'cancelled').length
    const expiredCount = db.orders.filter(o => o.status === 'expired').length
    const transactionRate = [
      { name: '待生产', value: toProduceCount },
      { name: '候补中', value: waitlistedCount },
      { name: '待取货', value: pendingPickupCount },
      { name: '已完成', value: completedCount },
      { name: '已取消', value: cancelledCount },
      { name: '已失效', value: expiredCount }
    ]

    const orderStatusDistribution = [...transactionRate]

    const durationTrend = [
      { date: '06/02', duration: 52 },
      { date: '06/03', duration: 48 },
      { date: '06/04', duration: 65 },
      { date: '06/05', duration: 72 },
      { date: '06/06', duration: 55 },
      { date: '06/07', duration: 60 },
      { date: '06/08', duration: 58 }
    ]

    const uniqueUsers = new Set(db.orders.map(o => o.userId)).size
    const repeatUsers = db.orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'expired')
      .reduce((acc: Record<number, number>, o) => {
        acc[o.userId] = (acc[o.userId] || 0) + 1
        return acc
      }, {})
    const repeatCount = Object.values(repeatUsers).filter(c => c > 1).length
    const repurchaseRate = uniqueUsers > 0 ? repeatCount / uniqueUsers : 0

    const waitlistedOrders = db.orders.filter(o => o.status === 'waitlisted' || o.promotedAt)
    const promotedOrders = db.orders.filter(o => o.promotedAt && o.status !== 'waitlisted')
    const waitlistConversionRate = waitlistedOrders.length > 0
      ? promotedOrders.length / waitlistedOrders.length
      : 0

    const allCompletedOrders = db.orders.filter(o => o.status === 'completed')
    const onTimeDelivered = allCompletedOrders.filter(o => {
      const gb = db.groupBuys.find(g => g.id === o.groupBuyId)
      if (!gb || !o.pickedUpAt) return true
      const pickupTime = new Date(gb.pickupTime).getTime()
      const pickedAt = new Date(o.pickedUpAt).getTime()
      return pickedAt <= pickupTime + 30 * 60 * 1000
    })
    const onTimeDeliveryRate = allCompletedOrders.length > 0
      ? onTimeDelivered.length / allCompletedOrders.length
      : 0

    const allTimeSlots: { total: number; filled: number }[] = []
    db.groupBuys.forEach(gb => {
      gb.timeSlots.forEach(ts => {
        allTimeSlots.push({ total: ts.capacity, filled: ts.filled })
      })
    })
    const totalSlotCapacity = allTimeSlots.reduce((s, t) => s + t.total, 0)
    const totalSlotFilled = allTimeSlots.reduce((s, t) => s + t.filled, 0)
    const timeSlotFulfillmentRate = totalSlotCapacity > 0
      ? totalSlotFilled / totalSlotCapacity
      : 0

    const recipeCapacityUtilization: Record<string, number> = {}
    db.recipes.forEach(r => {
      const relatedGbs = db.groupBuys.filter(g => g.recipeId === r.id)
      const capacity = relatedGbs.reduce((s, g) => s + g.maxQuantity * g.dailyBatches, 0)
      const utilized = db.orders.filter(o => {
        const gb = db.groupBuys.find(g => g.id === o.groupBuyId)
        return gb?.recipeId === r.id && o.status !== 'cancelled' && o.status !== 'expired'
      }).reduce((s, o) => s + o.quantity, 0)
      recipeCapacityUtilization[r.name] = capacity > 0 ? utilized / capacity : 0
    })

    const totalUsers = db.users.length
    const totalReviews = db.reviews.length
    const avgRating = totalReviews > 0
      ? db.reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
      : 0

    const slotDistribution = db.groupBuys.flatMap(gb => {
      const shortTitle = gb.title.length > 6 ? gb.title.slice(0, 6) : gb.title
      return gb.timeSlots.map(ts => ({
        name: `${shortTitle} ${ts.time}`,
        filled: ts.filled,
        capacity: ts.capacity
      }))
    })

    const recipeSalesMap: Record<string, number> = {}
    db.orders.forEach(o => {
      const gb = db.groupBuys.find(g => g.id === o.groupBuyId)
      const recipe = db.recipes.find(r => r.id === gb?.recipeId)
      if (recipe && o.status !== 'cancelled' && o.status !== 'expired') {
        recipeSalesMap[recipe.name] = (recipeSalesMap[recipe.name] || 0) + o.totalAmount
      }
    })
    const recipeSales = Object.entries(recipeSalesMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    const statistics: Statistics = {
      popularity,
      transactionRate,
      durationTrend,
      repurchaseRate,
      totalRecipes,
      totalGroupBuys,
      totalOrders,
      totalRevenue,
      totalUsers,
      totalReviews,
      avgRating,
      completedOrders: completedCount,
      waitlistConversionRate,
      onTimeDeliveryRate,
      timeSlotFulfillmentRate,
      recipeCapacityUtilization,
      orderStatusDistribution,
      slotDistribution,
      recipeSales
    }

    res.json(statistics)
  }

  return {
    getStatistics
  }
}
