import { Router } from 'express'
import { Database } from '../types'
import { createOrderController } from '../controllers/orderController'

export const createOrderRouter = (db: Database) => {
  const router = Router()
  const controller = createOrderController(db)

  router.get('/', controller.getAllOrders)
  router.get('/eligibility', controller.checkOrderEligibility)
  router.get('/group-buy/:groupBuyId', controller.getOrdersByGroupBuy)
  router.post('/', controller.createOrder)
  router.put('/:id/status', controller.updateOrderStatus)
  router.put('/:id/ready-pickup', controller.markReadyForPickup)
  router.delete('/:id', controller.deleteOrder)

  return router
}
